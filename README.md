Quicknote är ett RESTful API där användaren kan skapa anteckningar.
Användaren kan skapa ett konto, logga in (skapa, läsa, uppdatera, radera, söka) på sina anteckningar.
API:et kör JWT och dokumenterat med swagger

#funktioner
- Registrering & inloggning
- JWT autentisiering
- Skapa, hämta, uppdatera, radera och söka i anteckningarna
- Swagger dokumentation

#Teknisk info
- **Backend**: Node.js + Express
- **Databas**: PostgreSQL
- **Autentisiering**: JWT
- **Hashing**: bcrypt
- **Dokumentation**: Swagger OpenAPI 3.0

#installation

bash terminal
git clone https://github.com/Milton-web/Quicknote.git
cd api
npm install
node app.js


