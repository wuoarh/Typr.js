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

Typr.parse = function(buff)
{
	const readFont = function(data, idx, offset,tmap) {
		
		const prsr = {
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
		const obj = {"_data":data, "_index":idx, "_offset":offset};
		
		for(const t in prsr) {
			const tab = Typr.findTable(data, t, offset);
			if(tab) {
				const off=tab[0];
				let tobj = tmap[off];
				if(tobj==null) tobj = prsr[t].parseTab(data, off, tab[1], obj);
				obj[t] = tmap[off] = tobj;
			}
		}
		return obj;
	}
	
	const data = new Uint8Array(buff);
	
	const tmap = {};
	const tag = bin.readASCII(data, 0, 4);  
	if(tag=="ttcf") {
		let offset = 4;
		const majV = bin.readUshort(data, offset);  offset+=2;
		const minV = bin.readUshort(data, offset);  offset+=2;
		const numF = bin.readUint  (data, offset);  offset+=4;
		const fnts = [];
		for(let i = 0; i < numF; i++) {
			const foff = bin.readUint  (data, offset);  offset+=4;
			fnts.push(readFont(data, i, foff,tmap));
		}
		return fnts;
	}
	else return [readFont(data, 0, 0,tmap)];
}


Typr.findTable = function(data, tab, foff)
{
	const numTables = bin.readUshort(data, foff+4);
	let offset = foff+12;
	for(let i = 0; i < numTables; i++)
	{
		const tag      = bin.readASCII(data, offset, 4); 
		const checkSum = bin.readUint (data, offset+ 4);
		const toffset  = bin.readUint (data, offset+ 8); 
		const length   = bin.readUint (data, offset+12);
		if(tag==tab) return [toffset,length];
		offset+=16;
	}
	return null;
}
/*
Typr.splitBy = function(data,tag) {
	data = new Uint8Array(data);  console.log(data.slice(0,64));
	const ttcf = bin.readASCII(data, 0, 4);  if(ttcf!="ttcf") return {};
	
	const offset = 8;
	const numF = bin.readUint  (data, offset);  offset+=4;
	const colls = [], used={};
	for(const i=0; i<numF; i++) {
		const foff = bin.readUint  (data, offset);  offset+=4;
		const toff = Typr.findTable(data,tag,foff)[0];
		if(used[toff]==null) used[toff] = [];
		used[toff].push([foff,bin.readUshort(data,foff+4)]);  // font offset, numTables
	}
	for(const toff in used) {
		const offs = used[toff];
		const hlen = 12+4*offs.length;
		const out = new Uint8Array(hlen);		
		for(const i=0; i<8; i++) out[i]=data[i];
		bin.writeUint(out,8,offs.length);
		
		for(const i=0; i<offs.length; i++) hlen += 12+offs[i][1]*16;
		
		const hdrs = [out], tabs = [], hoff=out.length, toff=hlen, noffs={};
		for(const i=0; i<offs.length; i++) {
			bin.writeUint(out, 12+i*4, hoff);  hoff+=12+offs[i][1]*16;
			toff = Typr._cutFont(data, offs[i][0], hdrs, tabs, toff, noffs);
		}
		colls.push(Typr._joinArrs(hdrs.concat(tabs)));
	}
	return colls;
}

Typr.splitFonts = function(data) {
	data = new Uint8Array(data);
	const ttcf = bin.readASCII(data, 0, 4);  if(ttcf!="ttcf") return {};
	
	const offset = 8;
	const numF = bin.readUint  (data, offset);  offset+=4;
	const fnts = [];
	for(const i=0; i<numF; i++) {
		const foff = bin.readUint  (data, offset);  offset+=4;
		fnts.push(Typr._cutFont(data, foff));
		break;
	}
	return fnts;
}

Typr._cutFont = function(data,foff,hdrs,tabs,toff, noffs) {
	const numTables = bin.readUshort(data, foff+4);
	
	const out = new Uint8Array(12+numTables*16);  hdrs.push(out);
	for(const i=0; i<12; i++) out[i]=data[foff+i];  //console.log(out);
	
	const off = 12;
	for(const i=0; i<numTables; i++)
	{
		const tag      = bin.readASCII(data, foff+off, 4); 
		const checkSum = bin.readUint (data, foff+off+ 4);
		const toffset  = bin.readUint (data, foff+off+ 8); 
		const length   = bin.readUint (data, foff+off+12);
		
		while((length&3)!=0) length++;
		
		for(const j=0; j<16; j++) out[off+j]=data[foff+off+j];
		
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
	const len = 0;
	for(const i=0; i<tabs.length; i++) len+=tabs[i].length;
	const out = new Uint8Array(len), ooff=0;
	for(const i=0; i<tabs.length; i++) {
		const tab = tabs[i];
		for(const j=0; j<tab.length; j++) out[ooff+j]=tab[j];
		ooff+=tab.length;
	}
	return out;
}
*/

export default Typr;
