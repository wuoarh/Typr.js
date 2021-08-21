import bin from './typr.bin';

const hmtx = {
	parseTab : function(data, offset, length, font)
	{
		var aWidth = [];
		var lsBearing = [];
		
		var nG = font["maxp"]["numGlyphs"], nH = font["hhea"]["numberOfHMetrics"];
		var aw = 0, lsb = 0, i=0;
		while(i<nH) {  aw=bin.readUshort(data, offset+(i<<2));  lsb=bin.readShort(data, offset+(i<<2)+2);  aWidth.push(aw);  lsBearing.push(lsb);  i++;  }
		while(i<nG) {  aWidth.push(aw);  lsBearing.push(lsb);  i++;  }
		
		return {aWidth:aWidth, lsBearing:lsBearing};
	}
};

export default hmtx;
