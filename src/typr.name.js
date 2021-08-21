import bin from './typr.bin';

const name = {
	parseTab : function(data, offset, length)
	{
		const obj = {};
		const format = bin.readUshort(data, offset);  offset += 2;
		const count  = bin.readUshort(data, offset);  offset += 2;
		const stringOffset = bin.readUshort(data, offset);  offset += 2;
		
		//console.log(format,count);
		
		const names = [
			"copyright",
			"fontFamily",
			"fontSubfamily",
			"ID",
			"fullName",
			"version",
			"postScriptName",
			"trademark",
			"manufacturer",
			"designer",
			"description",
			"urlVendor",
			"urlDesigner",
			"licence",
			"licenceURL",
			"---",
			"typoFamilyName",
			"typoSubfamilyName",
			"compatibleFull",
			"sampleText",
			"postScriptCID",
			"wwsFamilyName",
			"wwsSubfamilyName",
			"lightPalette",
			"darkPalette"
		];
		
		const offset0 = offset;
		const rU = bin.readUshort;
		
		for(let i = 0; i < count; i++)
		{
			const platformID = rU(data, offset);  offset += 2;
			const encodingID = rU(data, offset);  offset += 2;
			const languageID = rU(data, offset);  offset += 2;
			const nameID     = rU(data, offset);  offset += 2;
			const slen       = rU(data, offset);  offset += 2;
			const noffset    = rU(data, offset);  offset += 2;
			//console.log(platformID, encodingID, languageID.toString(16), nameID, length, noffset);
			
			
			const soff = offset0 + count*12 + noffset;
			let str;
			if(false){}
			else if(platformID == 0) str = bin.readUnicode(data, soff, slen/2);
			else if(platformID == 3 && encodingID == 0) str = bin.readUnicode(data, soff, slen/2);
			else if(encodingID == 0) str = bin.readASCII  (data, soff, slen);
			else if(encodingID == 1) str = bin.readUnicode(data, soff, slen/2);
			else if(encodingID == 3) str = bin.readUnicode(data, soff, slen/2);
			else if(encodingID == 4) str = bin.readUnicode(data, soff, slen/2);
			else if(encodingID ==10) str = bin.readUnicode(data, soff, slen/2);
			
			else if(platformID == 1) { str = bin.readASCII(data, soff, slen);  console.log("reading unknown MAC encoding "+encodingID+" as ASCII") }
			else {
				console.log("unknown encoding "+encodingID + ", platformID: "+platformID);
				str = bin.readASCII(data, soff, slen);
			}
			
			const tid = "p"+platformID+","+(languageID).toString(16);//Typr._platforms[platformID];
			if(obj[tid]==null) obj[tid] = {};
			obj[tid][names[nameID]] = str;
			obj[tid]["_lang"] = languageID;
			//console.log(tid, obj[tid]);
		}
		/*
		if(format == 1)
		{
			const langTagCount = bin.readUshort(data, offset);  offset += 2;
			for(const i=0; i<langTagCount; i++)
			{
				const length  = bin.readUshort(data, offset);  offset += 2;
				const noffset = bin.readUshort(data, offset);  offset += 2;
			}
		}
		*/
		
		//console.log(obj);
		const psn = "postScriptName";
		
		for(const p in obj) if(obj[p][psn]!=null && obj[p]["_lang"]==0x0409) return obj[p];		// United States
		for(const p in obj) if(obj[p][psn]!=null && obj[p]["_lang"]==0x0000) return obj[p];		// Universal
		for(const p in obj) if(obj[p][psn]!=null && obj[p]["_lang"]==0x0c0c) return obj[p];		// Canada
		for(const p in obj) if(obj[p][psn]!=null) return obj[p];
		
		let out;
		for(const p in obj) { out=obj[p]; break; }
		console.log("returning name table with languageID "+ out._lang);
		if(out[psn]==null && out["ID"]!=null) out[psn]=out["ID"];
		return out;
	}
};

export default name;
