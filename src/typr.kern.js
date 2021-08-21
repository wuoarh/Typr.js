import bin from './typr.bin';

const kern = {
	parseTab : function(data, offset, length, font)
	{
		var version = bin.readUshort(data, offset);
		if(version==1) return kern.parseV1(data, offset, length, font);
		var nTables = bin.readUshort(data, offset+2);  offset+=4;
		
		var map = {glyph1: [], rval:[]};
		for(var i=0; i<nTables; i++)
		{
			offset+=2;	// skip version
			var length  = bin.readUshort(data, offset);  offset+=2;
			var coverage = bin.readUshort(data, offset);  offset+=2;
			var format = coverage>>>8;
			/* I have seen format 128 once, that's why I do */ format &= 0xf;
			if(format==0) offset = kern.readFormat0(data, offset, map);
			//else throw "unknown kern table format: "+format;
		}
		return map;
	},

	parseV1 : function(data, offset, length, font)
	{
		var version = bin.readFixed(data, offset);   // 0x00010000 
		var nTables = bin.readUint (data, offset+4);  offset+=8;
		
		var map = {glyph1: [], rval:[]};
		for(var i=0; i<nTables; i++)
		{
			var length = bin.readUint(data, offset);   offset+=4;
			var coverage = bin.readUshort(data, offset);  offset+=2;
			var tupleIndex = bin.readUshort(data, offset);  offset+=2;
			var format = coverage&0xff;
			if(format==0) offset = kern.readFormat0(data, offset, map);
			//else throw "unknown kern table format: "+format;
		}
		return map;
	},

	readFormat0 : function(data, offset, map)
	{
		var rUs = bin.readUshort;
		var pleft = -1;
		var nPairs        = rUs(data, offset);
		var searchRange   = rUs(data, offset+2);
		var entrySelector = rUs(data, offset+4);
		var rangeShift    = rUs(data, offset+6);  offset+=8;
		for(var j=0; j<nPairs; j++)
		{
			var left  = rUs(data, offset);  offset+=2;
			var right = rUs(data, offset);  offset+=2;
			var value = bin.readShort (data, offset);  offset+=2;
			if(left!=pleft) { map.glyph1.push(left);  map.rval.push({ glyph2:[], vals:[] }) }
			var rval = map.rval[map.rval.length-1];
			rval.glyph2.push(right);   rval.vals.push(value);
			pleft = left;
		}
		return offset;
	}
};

export default kern;
