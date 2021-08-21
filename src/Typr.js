import bin from './typr.bin';
import cmap from './typr.cmap';
import head from './typr.head';
import hhea from './typr.hhea';
import maxp from './typr.maxp';
import hmtx from './typr.hmtx';
import name from './typr.name';
import OS2 from './typr.OS2';
import post from './typr.post';
import loca from './typr.loca';
import kern from './typr.kern';
import glyf from './typr.glyf';
import cff from './typr.cff';
import svg from './typr.svg';

const Typr = {};

Typr.cmap = cmap;

Typr.parse = function(buff)
{
	var readFont = function(data, idx, offset,tmap) {
		
		var prsr = {
			"cmap": cmap,
			"head": head,
			"hhea": hhea,
			"maxp": maxp,
			"hmtx": hmtx,
			"name": name,
			"OS/2": OS2,
			"post": post,
			
			"loca": loca,
			"kern": kern,
			"glyf": glyf,
			
			"CFF ": cff,
			/*
			"GPOS",
			"GSUB",
			"GDEF",*/
			
			"SVG ": svg
			//"VORG",
		};
		var obj = {"_data":data, "_index":idx, "_offset":offset};
		
		for(var t in prsr) {
			var tab = Typr.findTable(data, t, offset);
			if(tab) {
				var off=tab[0], tobj = tmap[off];
				if(tobj==null) tobj = prsr[t].parseTab(data, off, tab[1], obj);
				obj[t] = tmap[off] = tobj;
			}
		}
		return obj;
	}
	
	var data = new Uint8Array(buff);
	
	var tmap = {};
	var tag = bin.readASCII(data, 0, 4);  
	if(tag=="ttcf") {
		var offset = 4;
		var majV = bin.readUshort(data, offset);  offset+=2;
		var minV = bin.readUshort(data, offset);  offset+=2;
		var numF = bin.readUint  (data, offset);  offset+=4;
		var fnts = [];
		for(var i=0; i<numF; i++) {
			var foff = bin.readUint  (data, offset);  offset+=4;
			fnts.push(readFont(data, i, foff,tmap));
		}
		return fnts;
	}
	else return [readFont(data, 0, 0,tmap)];
}


Typr.findTable = function(data, tab, foff)
{
	var numTables = bin.readUshort(data, foff+4);
	var offset = foff+12;
	for(var i=0; i<numTables; i++)
	{
		var tag      = bin.readASCII(data, offset, 4); 
		var checkSum = bin.readUint (data, offset+ 4);
		var toffset  = bin.readUint (data, offset+ 8); 
		var length   = bin.readUint (data, offset+12);
		if(tag==tab) return [toffset,length];
		offset+=16;
	}
	return null;
}
/*
Typr.splitBy = function(data,tag) {
	data = new Uint8Array(data);  console.log(data.slice(0,64));
	var ttcf = bin.readASCII(data, 0, 4);  if(ttcf!="ttcf") return {};
	
	var offset = 8;
	var numF = bin.readUint  (data, offset);  offset+=4;
	var colls = [], used={};
	for(var i=0; i<numF; i++) {
		var foff = bin.readUint  (data, offset);  offset+=4;
		var toff = Typr.findTable(data,tag,foff)[0];
		if(used[toff]==null) used[toff] = [];
		used[toff].push([foff,bin.readUshort(data,foff+4)]);  // font offset, numTables
	}
	for(var toff in used) {
		var offs = used[toff];
		var hlen = 12+4*offs.length;
		var out = new Uint8Array(hlen);		
		for(var i=0; i<8; i++) out[i]=data[i];
		bin.writeUint(out,8,offs.length);
		
		for(var i=0; i<offs.length; i++) hlen += 12+offs[i][1]*16;
		
		var hdrs = [out], tabs = [], hoff=out.length, toff=hlen, noffs={};
		for(var i=0; i<offs.length; i++) {
			bin.writeUint(out, 12+i*4, hoff);  hoff+=12+offs[i][1]*16;
			toff = Typr._cutFont(data, offs[i][0], hdrs, tabs, toff, noffs);
		}
		colls.push(Typr._joinArrs(hdrs.concat(tabs)));
	}
	return colls;
}

Typr.splitFonts = function(data) {
	data = new Uint8Array(data);
	var ttcf = bin.readASCII(data, 0, 4);  if(ttcf!="ttcf") return {};
	
	var offset = 8;
	var numF = bin.readUint  (data, offset);  offset+=4;
	var fnts = [];
	for(var i=0; i<numF; i++) {
		var foff = bin.readUint  (data, offset);  offset+=4;
		fnts.push(Typr._cutFont(data, foff));
		break;
	}
	return fnts;
}

Typr._cutFont = function(data,foff,hdrs,tabs,toff, noffs) {
	var numTables = bin.readUshort(data, foff+4);
	
	var out = new Uint8Array(12+numTables*16);  hdrs.push(out);
	for(var i=0; i<12; i++) out[i]=data[foff+i];  //console.log(out);
	
	var off = 12;
	for(var i=0; i<numTables; i++)
	{
		var tag      = bin.readASCII(data, foff+off, 4); 
		var checkSum = bin.readUint (data, foff+off+ 4);
		var toffset  = bin.readUint (data, foff+off+ 8); 
		var length   = bin.readUint (data, foff+off+12);
		
		while((length&3)!=0) length++;
		
		for(var j=0; j<16; j++) out[off+j]=data[foff+off+j];
		
		if(noffs[toffset]!=null) bin.writeUint(out,off+8,noffs[toffset]);
		else {
			noffs[toffset] = toff;
			bin.writeUint(out, off+8, toff);  
			tabs.push(new Uint8Array(data.buffer, toffset, length));  toff+=length;
		}
		off+=16;
	}
	return toff;
}
Typr._joinArrs = function(tabs) {
	var len = 0;
	for(var i=0; i<tabs.length; i++) len+=tabs[i].length;
	var out = new Uint8Array(len), ooff=0;
	for(var i=0; i<tabs.length; i++) {
		var tab = tabs[i];
		for(var j=0; j<tab.length; j++) out[ooff+j]=tab[j];
		ooff+=tab.length;
	}
	return out;
}
*/

export default Typr;
