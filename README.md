This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
## Getting Started
First, run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.<br>
Project has been deployed to vercel and can be accessed via following link: <br>
https://stock-analyzer-rd81b36r4-bik198.vercel.app/    <br>
Important notes:
-Used papaparse as a csv parsing library since it is a multi-threaded CSV parser that runs on web pages. Streaming could be used as a step or chunk function to stop browser crash for larger files. (Commented out in the codes as the requirement was not specified).
-In the example provided in the email 58.320000 was obtained from 231.67-173.35. Please note that the result has different fixed decimal point compared to the original values. Need more information of what is the logic behind this. In the code I have universally used 6 decimal points for results.
-Implemented Search Company feature for quick search in the results. 
