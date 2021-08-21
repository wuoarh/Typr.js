import bin from './typr.bin';

const head = {
	parseTab : function(data, offset, length)
	{
		const obj = {};
		const tableVersion = bin.readFixed(data, offset);  offset += 4;
		
		obj.fontRevision = bin.readFixed(data, offset);  offset += 4;
		const checkSumAdjustment = bin.readUint(data, offset);  offset += 4;
		const magicNumber = bin.readUint(data, offset);  offset += 4;
		obj.flags = bin.readUshort(data, offset);  offset += 2;
		obj.unitsPerEm = bin.readUshort(data, offset);  offset += 2;
		obj.created  = bin.readUint64(data, offset);  offset += 8;
		obj.modified = bin.readUint64(data, offset);  offset += 8;
		obj.xMin = bin.readShort(data, offset);  offset += 2;
		obj.yMin = bin.readShort(data, offset);  offset += 2;
		obj.xMax = bin.readShort(data, offset);  offset += 2;
		obj.yMax = bin.readShort(data, offset);  offset += 2;
		obj.macStyle = bin.readUshort(data, offset);  offset += 2;
		obj.lowestRecPPEM = bin.readUshort(data, offset);  offset += 2;
		obj.fontDirectionHint = bin.readShort(data, offset);  offset += 2;
		obj.indexToLocFormat  = bin.readShort(data, offset);  offset += 2;
		obj.glyphDataFormat   = bin.readShort(data, offset);  offset += 2;

		const verticalMask = 1 << 5;
		if ((obj.flags & verticalMask) !== 0) {
			throw new Error(`Vertical fonts not supported! in head.flags: ${obj.flags} bit 5: ${(obj.flags & verticalMask) !== 0}`);
		}
		return obj;
	}
};

export default head;
