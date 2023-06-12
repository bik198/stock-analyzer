"use client";

import React, { useEffect, useState } from "react";
import Papa from "papaparse";

type StockData = {
	Name: string;
	Date: string;
	notes: string;
	Value: string;
	Change: string;
};

const StockAnalyzer: React.FC = () => {
	const [stockData, setStockData] = useState<StockData[]>([]);
	const [largestStockData, setLargestStockData] = useState<{ company: string; largestIncrease: number }[]>([]);
	const [searchText, setSearchtext] = useState("");

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
			//Use step function for streaming if required
			// step: function(result, parser) {
			// 	setStockData(result.data);
			// };
			complete: result => {
				setStockData(result.data);
			},
			error: error => {
				console.error("Error parsing CSV:", error);
			},
		});
	};

	const parseStringCSV = async (file: string) => {
		Papa.parse<StockData>(file, {
			header: true,
			skipEmptyLines: true,
			//Use step function for streaming if required
			// step: function(result, parser) {
			// 	setStockData(result.data);			
			// handleAnalysis(result.data);
			// };
			complete: result => {
				setStockData(result.data);
				handleAnalysis(result.data);
			},
			error: (error: any) => {
				console.error("Error parsing CSV:", error);
			},
		});
	};

	const loadSampleData = async () => {
		const file = await fetch("./assets/values.csv");
		const reader = file.body?.getReader();
		const result = await reader?.read();
		const decoder = new TextDecoder("utf-8");
		const csv = decoder.decode(result?.value);
		parseStringCSV(csv);
	};

	const handleAnalysis = (data: StockData[]) => {
		setSearchtext("");
		const numericData = data.map(entry => {
			const stock = { ...entry, Value: 0 };
			stock.Value = parseFloat(entry.Value);
			return stock;
		});

		// Drop entries with NaN values in the 'Value' property
		const filteredData = numericData.filter(entry => !isNaN(entry.Value));

		// Sort the data array by the "date" property
		const dataWithDateSorting = filteredData.sort(
			(a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime()
		);

		const stocksWithLargestIncrease = calculateLargestIncrease(dataWithDateSorting);
		setLargestStockData(stocksWithLargestIncrease);

		stocksWithLargestIncrease.map(item => {
			console.log("Company:", item.company, ", Max absolute increase:", item.largestIncrease);
		});
	};

	const filteredData = largestStockData.filter(
		item =>
			item.company.toLocaleLowerCase().includes(searchText.toLocaleLowerCase()) ||
			searchText.toLocaleLowerCase().includes(item.company.toLocaleLowerCase())
	);

	const calculateLargestIncrease = (
		dataWithDateSorting: {
			Name: string;
			Date: string;
			notes: string;
			Value: number;
			Change: string;
		}[]
	) => {
		let largestIncrease: { company: string; largestIncrease: number }[] = [];

		for (let i = 0; i < dataWithDateSorting.length; i++) {
			const stock = dataWithDateSorting[i];
			const firstValue = dataWithDateSorting.find(s => s.Name === stock.Name);

			const sliced = dataWithDateSorting.slice(i);
			let lastValue;
			for (let i = sliced.length - 1; i >= 0; i--) {
				if (sliced[i].Name === stock.Name) {
					lastValue = sliced[i];
					break;
				}
			}

			if (firstValue !== undefined && lastValue !== undefined) {
				const absoluteIncrease = lastValue.Value - firstValue.Value;
				if (absoluteIncrease > 0) {
					largestIncrease.push({ company: stock.Name, largestIncrease: Number(absoluteIncrease.toFixed(6)) });
				}
			}
		}
		let filteredStocks: typeof largestIncrease = [];
		largestIncrease.filter(
			item => filteredStocks.findIndex(el => el.company === item.company) < 0 && filteredStocks.push(item)
		);
		return filteredStocks;
	};

	return (
		<div className="mx-auto flex min-h-screen flex-col items-center justify-center gap-4 px-4 py-6">
			<div className="flex flex-col items-center gap-2 rounded-lg bg-white px-4 py-4">
				<div className="flex w-full justify-end">
					<button
						className="rounded-md border bg-slate-700 px-3 py-2 text-xs text-gray-50 hover:bg-slate-500"
						onClick={loadSampleData}
					>
						Load Sample Data
					</button>
				</div>
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

			<div className="w-full max-w-md">
				<label htmlFor="searchText" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
					Search company
				</label>
				<input
					name="searchText"
					type="text"
					className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
					value={searchText}
					onChange={e => setSearchtext(e.target.value)}
				/>
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
						{filteredData.map(stock => (
							<tr className="border-b odd:bg-gray-600 even:bg-gray-500" key={stock.company}>
								<td className="px-4">{stock.company}</td>
								<td className="px-4 text-right">{(Math.round(stock.largestIncrease * 1000000) / 1000000).toFixed(6)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default StockAnalyzer;
