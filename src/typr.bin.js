const bin = {
	readFixed : function(data, o)
	{
		return ((data[o]<<8) | data[o+1]) +  (((data[o+2]<<8)|data[o+3])/(256*256+4));
	},
	readF2dot14 : function(data, o)
	{
		var num = bin.readShort(data, o);
		return num / 16384;
	},
	readInt : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		var a = bin.t.uint8;
		a[0] = buff[p+3];
		a[1] = buff[p+2];
		a[2] = buff[p+1];
		a[3] = buff[p];
		return bin.t.int32[0];
	},
	
	readInt8 : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		var a = bin.t.uint8;
		a[0] = buff[p];
		return bin.t.int8[0];
	},
	readShort : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		var a = bin.t.uint8;
		a[1] = buff[p]; a[0] = buff[p+1];
		return bin.t.int16[0];
	},
	readUshort : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		return (buff[p]<<8) | buff[p+1];
	},
	writeUshort : function(buff, p, n)
	{
		buff[p] = (n>>8)&255;  buff[p+1] = n&255;
	},
	readUshorts : function(buff, p, len)
	{
		var arr = [];
		for(var i=0; i<len; i++) {
			var v = bin.readUshort(buff, p+i*2);  //if(v==932) console.log(p+i*2);
			arr.push(v);
		}
		return arr;
	},
	readUint : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		var a = bin.t.uint8;
		a[3] = buff[p];  a[2] = buff[p+1];  a[1] = buff[p+2];  a[0] = buff[p+3];
		return bin.t.uint32[0];
	},
	writeUint: function(buff, p, n)
	{
		buff[p] = (n>>24)&255;  buff[p+1] = (n>>16)&255;  buff[p+2] = (n>>8)&255;  buff[p+3] = (n>>0)&255;
	},
	readUint64 : function(buff, p)
	{
		//if(p>=buff.length) throw "error";
		return (bin.readUint(buff, p)*(0xffffffff+1)) + bin.readUint(buff, p+4);
	},
	readASCII : function(buff, p, l)	// l : length in Characters (not Bytes)
	{
		//if(p>=buff.length) throw "error";
		var s = "";
		for(var i = 0; i < l; i++) s += String.fromCharCode(buff[p+i]);
		return s;
	},
	writeASCII : function(buff, p, s)	// l : length in Characters (not Bytes)
	{
		for(var i = 0; i < s.length; i++)	
			buff[p+i] = s.charCodeAt(i);
	},
	readUnicode : function(buff, p, l)
	{
		//if(p>=buff.length) throw "error";
		var s = "";
		for(var i = 0; i < l; i++)	
		{
			var c = (buff[p++]<<8) | buff[p++];
			s += String.fromCharCode(c);
		}
		return s;
	},
	_tdec : window["TextDecoder"] ? new window["TextDecoder"]() : null,
	readUTF8 : function(buff, p, l) {
		var tdec = bin._tdec;
		if(tdec && p==0 && l==buff.length) return tdec["decode"](buff);
		return bin.readASCII(buff,p,l);
	},
	readBytes : function(buff, p, l)
	{
		//if(p>=buff.length) throw "error";
		var arr = [];
		for(var i=0; i<l; i++) arr.push(buff[p+i]);
		return arr;
	},
	readASCIIArray : function(buff, p, l)	// l : length in Characters (not Bytes)
	{
		//if(p>=buff.length) throw "error";
		var s = [];
		for(var i = 0; i < l; i++)	
			s.push(String.fromCharCode(buff[p+i]));
		return s;
	}, 
	t: (function() {
		var ab = new ArrayBuffer(8);
		return {
			buff   : ab,
			int8   : new Int8Array  (ab),
			uint8  : new Uint8Array (ab),
			int16  : new Int16Array (ab),
			uint16 : new Uint16Array(ab),
			int32  : new Int32Array (ab),
			uint32 : new Uint32Array(ab)
		}  
	}())
};

export default bin;
