import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";

dotenv.config();

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

const database = [
  {
    product: "Beef",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 27,
    unit_of_carbon: "kg CO2e",
    date: "2024-01-15",
  },
  {
    product: "Chicken",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 6.9,
    unit_of_carbon: "kg CO2e",
    date: "2024-02-10",
  },
  {
    product: "Cheese",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 13.5,
    unit_of_carbon: "kg CO2e",
    date: "2024-03-05",
  },
  {
    product: "Rice",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 4.5,
    unit_of_carbon: "kg CO2e",
    date: "2024-04-20",
  },
  {
    product: "Eggs",
    unit_of_product: "dozen",
    number_of_units: "1",
    carbon_footprint: 3.8,
    unit_of_carbon: "kg CO2e",
    date: "2024-05-15",
  },
  {
    product: "Milk",
    unit_of_product: "liters",
    number_of_units: "1",
    carbon_footprint: 3.2,
    unit_of_carbon: "kg CO2e",
    date: "2024-06-25",
  },
  {
    product: "Lentils",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 0.9,
    unit_of_carbon: "kg CO2e",
    date: "2024-07-10",
  },
  {
    product: "Tomatoes",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 2.1,
    unit_of_carbon: "kg CO2e",
    date: "2024-08-18",
  },
  {
    product: "Potatoes",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 0.5,
    unit_of_carbon: "kg CO2e",
    date: "2024-09-05",
  },
  {
    product: "Apples",
    unit_of_product: "kg",
    number_of_units: "1",
    carbon_footprint: 0.4,
    unit_of_carbon: "kg CO2e",
    date: "2024-10-12",
  },
];

// Carbon Footprint Estimation Route
app.get("/carbon", async (req, res) => {
  const item = req.query.item;
  const apiKey = process.env.GEMINI_KEY;
  console.log(apiKey);

  const genAI = new GoogleGenerativeAI(String(apiKey));
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" },
  });

  const currentDate = new Date().toISOString().split("T")[0];

  const prompt = `Estimate the total carbon footprint of ${item} from production to retail, considering factors such as farming, processing, transportation, and packaging. Additionally, identify the most sustainable brand for this product based on its carbon footprint, ethical sourcing, and packaging sustainability. Use the following JSON schema:
  
    CarbonFootPrint = {
      "product": str,
      "unit_of_product": str,
      "number_of_units": str,
      "carbon_footprint": number,
      "unit_of_carbon" : str,
      "sustainable_brand": str,
      "date": "${currentDate}"
    }
  
    Return the result as a JSON object.`;

  try {
    const data = await model.generateContent(prompt);
    const result = await data.response.text();
    console.log(result);

    const jsonObject = JSON.parse(result);
    database.push(jsonObject);
    res.json(jsonObject);
  } catch (error) {
    res.status(500).json({ error: "Error generating carbon footprint data." });
  }
});

// Delete Last Entry Route
app.get("/delete", (req, res) => {
  if (database.length > 0) {
    database.pop();
    res.json({ message: "Last entry deleted.", database });
  } else {
    res.json({ message: "Database is empty." });
  }
});

// History Route (Fetch All Entries)
app.get("/history", (req, res) => {
  res.json(database);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
