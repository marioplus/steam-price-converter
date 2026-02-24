import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// 读取当前项目的版本号和日期
const pkgPath = resolve(process.cwd(), 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
const version = pkg.version;
const date = new Date().toISOString().split('T')[0];

const changelogPath = resolve(process.cwd(), 'CHANGELOG.md');
let changelog = readFileSync(changelogPath, 'utf8');

// 匹配 [Unreleased] 部分
const unreleasedHeader = '## [Unreleased]';
const newVersionHeader = `## [${version}] - ${date}`;

// 如果 [Unreleased] 存在且下方有内容，则进行迁移
if (changelog.includes(unreleasedHeader)) {
    // 插入新版本标题，并重置 [Unreleased] 下的内容模板
    const template = `## [Unreleased]

### Added
- 

### Changed
- 

### Deprecated
- 

### Removed
- 

### Fixed
- 

### Security
- 
`;

    // 找到 [Unreleased] 之后到下一个 ## 之前的内容，或者到文件结尾
    const parts = changelog.split(unreleasedHeader);
    if (parts.length > 1) {
        let contentAfter = parts[1];
        // 找到下一个二级标题的位置
        const nextHeaderIndex = contentAfter.indexOf('\n## ');

        let unreleasedContent = '';
        let restOfFile = '';

        if (nextHeaderIndex !== -1) {
            unreleasedContent = contentAfter.substring(0, nextHeaderIndex).trim();
            restOfFile = contentAfter.substring(nextHeaderIndex);
        } else {
            unreleasedContent = contentAfter.trim();
        }

        // --- 核心逻辑：过滤空标签 ---
        const sections = unreleasedContent.split(/^### /m);
        const filteredSections = sections.map(section => {
            if (!section.trim()) return '';

            // 提取内容（去除标题行）
            const lines = section.split('\n');
            const content = lines.slice(1).join('\n');

            // 检查内容是否包含除横杠、空格、换行符、回车符以外的字符
            const hasRealContent = content.replace(/[\-\s\r\n]/g, '').length > 0;

            return hasRealContent ? `### ${section.trim()}\n\n` : '';
        }).filter(s => s !== '');

        const finalUnreleasedContent = filteredSections.join('').trim();

        // 拼接新的内容
        const updatedChangelog = parts[0] + template + '\n' + newVersionHeader + '\n\n' + finalUnreleasedContent + '\n' + restOfFile;

        writeFileSync(changelogPath, updatedChangelog, 'utf8');
        console.log(`✅ CHANGELOG.md 已自动归档至版本 [${version}]`);
    }
} else {
    console.warn('⚠️ 未在 CHANGELOG.md 中找到 [Unreleased] 标记，跳过自动归档。');
}
