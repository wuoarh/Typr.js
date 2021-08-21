import bin from './typr.bin';

const hhea = {
	parseTab : function(data, offset, length)
	{
		const obj = {};
		const tableVersion = bin.readFixed(data, offset);  offset += 4;
		
		const keys = ["ascender","descender","lineGap",
			"advanceWidthMax","minLeftSideBearing","minRightSideBearing","xMaxExtent",
			"caretSlopeRise","caretSlopeRun","caretOffset",
			"res0","res1","res2","res3",
			"metricDataFormat","numberOfHMetrics" ];
			
		for(let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const func = (key=="advanceWidthMax" || key=="numberOfHMetrics")?bin.readUshort:bin.readShort;
			obj[key]=func(data,offset+i*2);
		}
		return obj;
	}
};

export default hhea;