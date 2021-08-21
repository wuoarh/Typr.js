import bin from './typr.bin';

const kern = {
	parseTab : function(data, offset, length, font)
	{
		const version = bin.readUshort(data, offset);
		if(version==1) return kern.parseV1(data, offset, length, font);
		const nTables = bin.readUshort(data, offset+2);  offset+=4;
		
		const map = {glyph1: [], rval:[]};
		for(let i = 0; i < nTables; i++)
		{
			offset+=2;	// skip version
			const length  = bin.readUshort(data, offset);  offset+=2;
			const coverage = bin.readUshort(data, offset);  offset+=2;
			let format = coverage>>>8;
			/* I have seen format 128 once, that's why I do */ format &= 0xf;
			if(format==0) offset = kern.readFormat0(data, offset, map);
			//else throw "unknown kern table format: "+format;
		}
		return map;
	},

	parseV1 : function(data, offset, length, font)
	{
		const version = bin.readFixed(data, offset);   // 0x00010000 
		const nTables = bin.readUint (data, offset+4);  offset+=8;
		
		const map = {glyph1: [], rval:[]};
		for(let i = 0; i < nTables; i++)
		{
			const length = bin.readUint(data, offset);   offset+=4;
			const coverage = bin.readUshort(data, offset);  offset+=2;
			const tupleIndex = bin.readUshort(data, offset);  offset+=2;
			const format = coverage&0xff;
			if(format==0) offset = kern.readFormat0(data, offset, map);
			//else throw "unknown kern table format: "+format;
		}
		return map;
	},

	readFormat0 : function(data, offset, map)
	{
		const rUs = bin.readUshort;
		let pleft = -1;
		const nPairs        = rUs(data, offset);
		const searchRange   = rUs(data, offset+2);
		const entrySelector = rUs(data, offset+4);
		const rangeShift    = rUs(data, offset+6);  offset+=8;
		for(let j = 0; j < nPairs; j++)
		{
			const left  = rUs(data, offset);  offset+=2;
			const right = rUs(data, offset);  offset+=2;
			const value = bin.readShort (data, offset);  offset+=2;
			if(left!=pleft) { map.glyph1.push(left);  map.rval.push({ glyph2:[], vals:[] }) }
			const rval = map.rval[map.rval.length-1];
			rval.glyph2.push(right);   rval.vals.push(value);
			pleft = left;
		}
		return offset;
	}
};

export default kern;
