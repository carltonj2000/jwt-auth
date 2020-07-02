require("dotenv").config();
const app = require("./auth");

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.info(`Server on port ${PORT}.`));
