// CSV解析器模块
class CSVParser {
    constructor() {
        this.currentData = [];
        this.currentHeaders = [];
        this.currentFileName = '';
        this.coordinateData = [];
        this.xColumn = '';
        this.yColumn = '';
    }

    // 解析CSV主函数
    async parseCSVFile(file) {
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
            throw new Error('请选择CSV格式的文件');
        }

        this.currentFileName = file.name;

        try {
            const text = await file.text();
            this.parseCSVText(text);
            return this.coordinateData;
        } catch (error) {
            throw new Error('文件读取失败: ' + error.message);
        }
    }

    // 解析CSV文本
    parseCSVText(text) {
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length === 0) {
            throw new Error('CSV文件为空');
        }

        // 解析标题行
        const headerLine = lines[0];
        this.currentHeaders = this.parseCSVLine(headerLine);

        // 解析数据行
        const dataLines = lines.slice(1);
        this.currentData = dataLines.map((line, index) => {
            const values = this.parseCSVLine(line);
            const row = {};
            this.currentHeaders.forEach((header, headerIndex) => {
                row[header] = values[headerIndex] || '';
            });
            return { id: index + 1, ...row };
        });

        if (this.currentData.length === 0) {
            throw new Error('CSV文件没有数据行');
        }

        // 提取坐标数据
        this.extractCoordinates();
    }

    // 提取坐标数据
    extractCoordinates() {
        // 尝试自动识别x,y列
        const possibleXNames = ['x', 'X', 'longitude', 'lng', 'lon', '经度', '经度(x)'];
        const possibleYNames = ['y', 'Y', 'latitude', 'lat', '纬度', '纬度(y)'];

        this.xColumn = '';
        this.yColumn = '';

        // 查找x列
        for (const name of possibleXNames) {
            const found = this.currentHeaders.find(header =>
                header.toLowerCase().includes(name.toLowerCase())
            );
            if (found) {
                this.xColumn = found;
                break;
            }
        }

        // 查找y列
        for (const name of possibleYNames) {
            const found = this.currentHeaders.find(header =>
                header.toLowerCase().includes(name.toLowerCase())
            );
            if (found) {
                this.yColumn = found;
                break;
            }
        }

        // 如果没有找到，使用前两列
        if (!this.xColumn && this.currentHeaders.length >= 1) {
            this.xColumn = this.currentHeaders[0];
        }
        if (!this.yColumn && this.currentHeaders.length >= 2) {
            this.yColumn = this.currentHeaders[1];
        }

        if (!this.xColumn || !this.yColumn) {
            throw new Error('无法识别坐标列，CSV文件应包含x,y坐标数据');
        }

        // 提取坐标数据
        this.coordinateData = this.currentData.map(row => {
            const x = parseFloat(row[this.xColumn]);
            const y = parseFloat(row[this.yColumn]);

            if (isNaN(x) || isNaN(y)) {
                return null;
            }

            return [x, y];
        }).filter(point => point !== null);

        if (this.coordinateData.length === 0) {
            throw new Error('未找到有效的坐标数据');
        }

        // 确保路径是闭合的
        if (this.coordinateData.length > 0) {
            const firstPoint = this.coordinateData[0];
            const lastPoint = this.coordinateData[this.coordinateData.length - 1];
            if (firstPoint[0] !== lastPoint[0] || firstPoint[1] !== lastPoint[1]) {
                this.coordinateData.push([...firstPoint]);
            }
        }
    }

    // 解析CSV行
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current.trim());
        return result;
    }

    // 获取解析结果
    getCoordinates() {
        return this.coordinateData;
    }

    // 获取解析信息
    getInfo() {
        return {
            fileName: this.currentFileName,
            pointCount: this.coordinateData.length,
            xColumn: this.xColumn,
            yColumn: this.yColumn,
            headers: this.currentHeaders,
            data: this.currentData
        };
    }

    // 清除数据
    clear() {
        this.currentData = [];
        this.currentHeaders = [];
        this.currentFileName = '';
        this.coordinateData = [];
        this.xColumn = '';
        this.yColumn = '';
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVParser;
} else {
    window.CSVParser = CSVParser;
}