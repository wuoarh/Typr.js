import bin from './typr.bin';

const maxp = {
	parseTab : function(data, offset, length)
	{
		//console.log(data.length, offset, length);
		
		var rU=bin.readUshort;
		var obj = {};
		
		// both versions 0.5 and 1.0
		var ver = bin.readUint(data, offset); offset += 4;
		
		obj["numGlyphs"] = rU(data, offset);  offset += 2;
		
		// only 1.0
		/*
		if(ver == 0x00010000) {
			obj.maxPoints             = rU(data, offset);  offset += 2;
			obj.maxContours           = rU(data, offset);  offset += 2;
			obj.maxCompositePoints    = rU(data, offset);  offset += 2;
			obj.maxCompositeContours  = rU(data, offset);  offset += 2;
			obj.maxZones              = rU(data, offset);  offset += 2;
			obj.maxTwilightPoints     = rU(data, offset);  offset += 2;
			obj.maxStorage            = rU(data, offset);  offset += 2;
			obj.maxFunctionDefs       = rU(data, offset);  offset += 2;
			obj.maxInstructionDefs    = rU(data, offset);  offset += 2;
			obj.maxStackElements      = rU(data, offset);  offset += 2;
			obj.maxSizeOfInstructions = rU(data, offset);  offset += 2;
			obj.maxComponentElements  = rU(data, offset);  offset += 2;
			obj.maxComponentDepth     = rU(data, offset);  offset += 2;
		}
		*/
		
		return obj;
	}
};

export default maxp;
