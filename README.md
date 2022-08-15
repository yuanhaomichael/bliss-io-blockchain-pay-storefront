# storefront

- get react context to work so that cart total amount is updated constantly //
- basic tx support //
- confirmation status page after tx confirmed - monday //
- add conversion API //
- display price in both usdc and sol //
- have ordering page know payment method (sol or usdc) //
- integrate both usdc and sol tx (2 "place order" buttons) //
- calculate amount from params in the backend //
- mobile wallet integrations //
- mobile first CSS optimization //
- throttling issues //

---

# Tx request

- modify makeTransaction API to handle both get and post //
- update QR code generation //
- host the api at a custom domain on serverless in AWS Lambda //

---

# loyalty

- create local script to create the thank you point token //
- add logic in makeTransaction.ts to check for thank you points holdings in customer account //
- add discount logic in makeTransaction.ts //
- add file in lib to calculate point rewards //
- add logic to transfer new point awards in makeTransaction.ts //
- db client connection //
- add logic to write appropriate fields into db in makeTransaction //

- host endpoint in blockchain-pay-apis to query database info and display confirmation page for mobile

- local script to mint NFTs
- add logic to check for NFT coupons against db NFT badge collections in merchant table
- calculate discount in lib function and add discount logic in makeTransaction.ts
- function for burning NFT
- trigger NFT burning in makeTransaction.ts
- logic to update DB

# customer dashboard

- new repo for customer dashboard
- wallet connection
- front end
- display data from wallet account
- display data from database
- add a QR and link to customer dashboard after shop purchase
