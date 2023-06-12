"use client";

import React, { useState } from "react";
import Papa from "papaparse";

type StockData = {
	Name: string;
	Date: string;
	notes: string;
	Value: number;
	Change: string;
};

const StockAnalyzer: React.FC = () => {
	const [stockData, setStockData] = useState<StockData[]>([]);
	const [largestStockData, setLargestStockData] = useState<{ company: string; largestIncrease: number }[]>([]);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (event.target.files && event.target.files[0]) {
			const file = event.target.files[0];
			parseCSV(file);
		}
	};

	const parseCSV = (file: File) => {
		Papa.parse<StockData>(file, {
			header: true,
			skipEmptyLines: true,
			// Use step function for streaming if required
			// step: function(result) {
			// 	const data=(result.data);
			// 	setStockData({ ...stockData, Name: data.Name, newDate: data.Date, Value: data.Value })
			// },
			complete: result => {
				const data = result.data.filter(element => !isNaN(element.Value)).map(element => ({ Name: element.Name, newDate: element.Date, Value: element.Value }))
				setStockData(data);
			},
			error: error => {
				console.error("Error parsing CSV:", error);
			},
		});
	};
	const handleAnalysis = (data: StockData[]) => {
		setLargestStockData(calculateLargestIncrease(stockData));
	};

	const calculateLargestIncrease = (
		dataWithDateSorting: {
			Name: string;
			newDate: string;
			notes: string;
			Value: number;
			Change: string;
		}[]
	) => {
		let largestIncrease: { company: string; largestIncrease: number }[] = [];
		const data = dataWithDateSorting;
		const dateMap = {};
		let highestDifference = 0;
		let highestDifferenceName = '';
		for (const obj of data) {

			const { Name, Value } = obj;
			const date = new Date(obj.newDate);

			if (Name in dateMap) {
				const { values, oldestDate, newestDate } = dateMap[Name];
				values.push(Value);

				if (date < oldestDate) dateMap[Name].oldestDate = date, dateMap[Name].lowestValue = Value;
				if (date > newestDate) dateMap[Name].newestDate = date, dateMap[Name].highestValue = Value;
			} else {
				dateMap[Name] = { values: [Value], oldestDate: date, newestDate: date, lowestValue: Value, highestValue: Value };
			}
		}
		for (const name in dateMap) {
			const { highestValue, lowestValue } = dateMap[name];
			const difference = highestValue - lowestValue;

			if (difference > highestDifference) highestDifference = difference, highestDifferenceName = name;
		}

		largestIncrease.push({ company: highestDifferenceName, largestIncrease: Number(highestDifference.toFixed(6)) });
		return largestIncrease;
	};

	return (
		<div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
			<div className="flex flex-col items-center gap-2 rounded-lg bg-white px-4 py-4">
				<div className="flex gap-2">
					<input className="h-full border text-xs text-black" type="file" accept=".csv" onChange={handleFileUpload} />
					<button
						className="rounded-md border px-2 py-1  text-xs text-black hover:bg-slate-200"
						onClick={() => handleAnalysis(stockData)}
					>
						Analyze Stock Data
					</button>
				</div>
			</div>

			<div className="relative h-full  max-h-[500px] min-h-[500px] overflow-y-auto">
				<table>
					<thead className="sticky top-0 border-b bg-black ">
						<tr>
							<th className="pr-20 text-left">Company</th>
							<th className="pl-20 pr-5 text-right">Max absolute increase</th>
						</tr>
					</thead>
					<tbody>
						{largestStockData.map(stock => (
							<tr className="border-b odd:bg-gray-600 even:bg-gray-500" key={stock.company}>
								<td className="px-4">{stock.company}</td>
								<td className="px-4 text-right">{stock.largestIncrease > 0 ? (Math.round(stock.largestIncrease * 100) / 100).toFixed(3) : "Nil"}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default StockAnalyzer;
