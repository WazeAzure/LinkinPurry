# Tugas Besar IF3110 2024/2025

<div align="center">

![LinkInPurry Logo](frontend/public/linkinpurry.svg)

## LinkInPurry - A professional, almost-like LinkedIn, networking website

</div>

### App Description 📕
![LinkInPurry Logo](frontend/public/divider.png)

**LinkInPurry** is a web platform designed to assist agents (including Purry the Platypus) in finding job opportunities that match their skills. It enables easy access to job vacancy information and streamlines the job search process efficiently and quickly.

### Requirements ⌥
![LinkInPurry Logo](frontend/public/divider.png)

- Docker (Make sure Docker is installed and running on your system)


### Installation Guideline 🧑🏻‍🦯
![LinkInPurry Logo](frontend/public/divider.png)
1. Clone this repository
    ```sh
    git clone https://github.com/Labpro-21/if-3310-2024-2-k01-07.git
    ```
2. Navigate to the project directory
   ```sh
   cd if-3310-2024-2-k01-07
   ```
3. Build the Docker containers
   ```sh
   docker compose build
   ```
4. Start the containers in detached mode
   ```sh
   docker compose up -d
   ```

### How to Run Server 🏃‍♀️
![LinkInPurry Logo](frontend/public/divider.png)

To launch the server, use the following commands:
1. Build and start the Docker containers:
    ```sh
    docker compose build
    docker compose up -d
    ```
2. To stop and remove the containers along with volumes:
    ```sh
    docker compose down -v
    ```
3. Access the PostgreSQL database:
    ```sh
    psql -U wbd -d linkinpurry
    ```

### API Documentation 📊
![LinkInPurry Logo](frontend/public/divider.png)

The API documentation can be accessed here: http://localhost:3000/documentation/static/index.html

![Documentation](frontend/public/documentation.png)


### Workload 👀
![LinkInPurry Logo](frontend/public/divider.png)

<h4 align="center"> <b>Overall Description</b></h4>

```
Orz --> orang sujud

O  r  z --> kaki tekuk
^  ^
|  badan
kepala
```


| NIM | Nama | Peran | Kesan |
| --- | --- | --- | --- |
| 13522013 | Denise Felicia Tiowanni | Carry Lord FE | Orz | 
| 13522039 | Edbert Eddyson Gunawan | satpam jaga kandang >///< | CARRY LORD BE |
| 13522060 | Andhita Naura Hariyanto | Carry Compnay | aga roler coaster  |


<h4 align="center"> <b>On serious side..</b></h4>

#### Setup
| Task | PIC|
| --- | --- |
| Docker Setup | 13522039 |
| Security Handling | 13522039 |

#### Main Feature

| Description | Front End | Back End |
| --- | --- | --- |
| Login | 13522013 | 13522039 |
| Register | 13522013 | 13522039 |
| Profile | 13522013 | 13522013 |
| Feed | 13522013 | 13522013 |
| Daftar Pengguna | 13522060 | 13522060 |
| Permintaan Koneksi   | 13522060 | 13522060 |
| Daftar Koneksi | 13522060 | 13522060 |
| Chat | 13522013 | 13522013 |
| Authentication and Authorization | 13522013 | 13522039 |
| Websocket | 13522013 | 13522013 |
| Notification | 13522039 | 13522039 |
| Stress and Load Test |  |  |
| All Responsive Web Design | 13522013, 13522060 | - |

#### Bonuses
![LinkInPurry Logo](frontend/public/divider.png)

| Deskripsi | Kontributor |
| --- | --- |
| LinkedIn UI | 13522013, 13522060 |
| Google Lighthouse | 13522013, 13522039, 13522060 |

#### Google Lighthouse
Note: Performance might not reach 80 because of the unused JavaScripts, should've used npm run preview instead.
1. Home
![LinkInPurry Logo](frontend/public/lighthouse/home.png)
2. Sign Up
![LinkInPurry Logo](frontend/public/lighthouse/signup.png)
3. Sign In
![LinkInPurry Logo](frontend/public/lighthouse/signin.png)
4. Profile
![LinkInPurry Logo](frontend/public/lighthouse/profile.png)
5. Network
![LinkInPurry Logo](frontend/public/lighthouse/network.png)
![LinkInPurry Logo](frontend/public/lighthouse/network2.png)
6. Chat
![LinkInPurry Logo](frontend/public/lighthouse/chat.png)
7. Feeds
![LinkInPurry Logo](frontend/public/lighthouse/feeds.png)

8. ![LinkInPurry Logo](frontend\public\tes.jpg)