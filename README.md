# WiFi-Access-Control-System
A secure and customizable system that allows users to access a WiFi network **only after payment**. The system uses a **captive portal**, integrated **payment gateway**, and **access control** logic to manage internet access for users in public or commercial spaces.


## Features
- Captive portal that redirects users after WiFi connection
- Purchase of internet access based on time
- Integration with payment gateway (MPESA Daraja API)
- Access control based on MAC/IP and time
- Admin dashboard to view and manage connected users

## Tech Stack

| Component        | Technology Used     |
|------------------|---------------------|
| Router Firmware  | OpenWRT             |
| Captive Portal   | NoDogSplash         |
| Backend          | Node.js             |
| Database         | PostgreSQL          |
| Payment Gateway  | MPESA Daraja API    |
| Access Control   | IpTables            |

## System Architecture

1. User connects to open WiFi network
2. Captive portal redirects the user to the login page
3. User logs in or registers and selects an access plan
4. After successful payment, access is granted for a limited time.
5. After expiry, access is automatically revoked

## Installation

### 1. Flash router with OpenWRT

Follow instruction at: [OpenWrt Website](https://openwrt.org/)

### 2. Set Up captive Portal

Install NpDogSplash:
```bash
opkg update
opkg install nodogsplash
```

Confogure redirect to your backend URL.

### 3. Set Up backend Server

```bash
git clone https://github.com/bruceoaudo/WiFi-Access-Control-System.git
cd WiFi-Access-Control-System
npm install
```

### 4. Set Up Environment Variables
```env
PORT=3000
DATABASE_URL=
MPESA_SECRET_KEY=
```

### 5. Run The Server
```bash
npm start
```

## Use Cases
- Cafes, restaurants, and hotels
- Student hostels or shared living spaces
- Internet cafes or co-working spaces
- Public event venues

## Future Enhancements
- Data-Based Access Controls
- SMS sending when user buys a plan or when the plan expires
- Usage Analytics & Reporting

## Licence
This project is licenced under the MIT License.

## Author

Bruce Audo

bruceodoyoaudo@gmail.com

[Github profile](https://github.com/bruceoaudo)
