import bin from './typr.bin';

const cmap = {
	parseTab : function(data, offset, length)
	{
		const obj = {tables:[],ids:{},off:offset};
		data = new Uint8Array(data.buffer, offset, length);
		offset = 0;

		const offset0 = offset;
		const rU = bin.readUshort;
		const version   = rU(data, offset);  offset += 2;
		const numTables = rU(data, offset);  offset += 2;
		
		//console.log(version, numTables);
		
		const offs = [];
		
		
		for(let i = 0; i < numTables; i++)
		{
			const platformID = rU(data, offset);  offset += 2;
			const encodingID = rU(data, offset);  offset += 2;
			const noffset = bin.readUint(data, offset);       offset += 4;
			
			const id = "p"+platformID+"e"+encodingID;
			
			//console.log("cmap subtable", platformID, encodingID, noffset);
			
			
			let tind = offs.indexOf(noffset);
			
			if(tind==-1)
			{
				tind = obj.tables.length;
				let subt = {};
				offs.push(noffset);
				//const time = Date.now();
				const format = subt.format = rU(data, noffset);
				if     (format== 0) subt = cmap.parse0(data, noffset, subt);
				//else if(format== 2) subt.off = noffset;
				else if(format== 4) subt = cmap.parse4(data, noffset, subt);
				else if(format== 6) subt = cmap.parse6(data, noffset, subt);
				else if(format==12) subt = cmap.parse12(data,noffset, subt);
				//console.log(format, Date.now()-time);
				//else console.log("unknown format: "+format, platformID, encodingID, noffset);
				obj.tables.push(subt);
			}
			
			if(obj.ids[id]!=null) throw "multiple tables for one platform+encoding";
			obj.ids[id] = tind;
		}
		return obj;
	},

	parse0 : function(data, offset, obj)
	{
		offset += 2;
		const len    = bin.readUshort(data, offset);  offset += 2;
		const lang   = bin.readUshort(data, offset);  offset += 2;
		obj.map = [];
		for(let i = 0; i < len - 6; i++) obj.map.push(data[offset+i]);
		return obj;
	},

	parse4 : function(data, offset, obj)
	{
		const rU = bin.readUshort, rUs = bin.readUshorts;
		const offset0 = offset;
		offset+=2;
		const length   = rU(data, offset);  offset+=2;
		const language = rU(data, offset);  offset+=2;
		const segCountX2 = rU(data, offset);  offset+=2;
		const segCount = segCountX2>>>1;
		obj.searchRange = rU(data, offset);  offset+=2;
		obj.entrySelector = rU(data, offset);  offset+=2;
		obj.rangeShift = rU(data, offset);  offset+=2;
		obj.endCount   = rUs(data, offset, segCount);  offset += segCount*2;
		offset+=2;
		obj.startCount = rUs(data, offset, segCount);  offset += segCount*2;
		obj.idDelta = [];
		for(const i=0; i<segCount; i++) {obj.idDelta.push(bin.readShort(data, offset));  offset+=2;}
		obj.idRangeOffset = rUs(data, offset, segCount);  offset += segCount*2;
		obj.glyphIdArray  = rUs(data, offset, ((offset0+length)-offset)>>>1);  //offset += segCount*2;
		return obj;
	},

	parse6 : function(data, offset, obj)
	{
		const offset0 = offset;
		offset+=2;
		const length = bin.readUshort(data, offset);  offset+=2;
		const language = bin.readUshort(data, offset);  offset+=2;
		obj.firstCode = bin.readUshort(data, offset);  offset+=2;
		const entryCount = bin.readUshort(data, offset);  offset+=2;
		obj.glyphIdArray = [];
		for(let i = 0; i < entryCount; i++) {obj.glyphIdArray.push(bin.readUshort(data, offset));  offset+=2;}
		
		return obj;
	},

	parse12 : function(data, offset, obj)
	{
		const rU = bin.readUint;
		const offset0 = offset;
		offset+=4;
		const length = rU(data, offset);  offset+=4;
		const lang   = rU(data, offset);  offset+=4;
		const nGroups= rU(data, offset)*3;  offset+=4;
		
		const gps = obj.groups = new Uint32Array(nGroups);//new Uint32Array(data.slice(offset, offset+nGroups*12).buffer);  
		
		for(let i = 0; i < nGroups; i+=3) {
			gps[i  ] = rU(data, offset+(i<<2)  );
			gps[i+1] = rU(data, offset+(i<<2)+4);
			gps[i+2] = rU(data, offset+(i<<2)+8);
		}
		return obj;
	}
};

export default cmap;
