import bin from './typr.bin';

const SVG = {
	parseTab : function(data, offset, length)
	{
		const obj = { entries: []};

		const offset0 = offset;

		const tableVersion = bin.readUshort(data, offset);	offset += 2;
		const svgDocIndexOffset = bin.readUint(data, offset);	offset += 4;
		const reserved = bin.readUint(data, offset); offset += 4;

		offset = svgDocIndexOffset + offset0;

		const numEntries = bin.readUshort(data, offset);	offset += 2;

		for(let i = 0; i < numEntries; i++)
		{
			const startGlyphID = bin.readUshort(data, offset);  offset += 2;
			const endGlyphID   = bin.readUshort(data, offset);  offset += 2;
			const svgDocOffset = bin.readUint  (data, offset);  offset += 4;
			const svgDocLength = bin.readUint  (data, offset);  offset += 4;

			const sbuf = new Uint8Array(data.buffer, offset0 + svgDocOffset + svgDocIndexOffset, svgDocLength);
			const svg = bin.readUTF8(sbuf, 0, sbuf.length);
			
			for(let f = startGlyphID; f <= endGlyphID; f++) {
				obj.entries[f] = svg;
			}
		}
		return obj;
	}
};

export default SVG;
