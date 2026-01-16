"use client";

import { useState, useEffect, useMemo } from "react";
import { Check, ChevronsUpDown, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useLanguage } from "@/contexts/language-context";

interface Timezone {
	id: string;
	name: string;
	offset: string;
	city: string;
	country: string;
	iana: string;
}

const timezones: Timezone[] = [
	// UTC-12 to UTC-11
	{
		id: "baker-island",
		name: "Baker Island Time",
		offset: "-12:00",
		city: "Baker Island",
		country: "US Minor Outlying Islands",
		iana: "Etc/GMT+12",
	},
	{
		id: "pago-pago",
		name: "Samoa Standard Time",
		offset: "-11:00",
		city: "Pago Pago",
		country: "American Samoa",
		iana: "Pacific/Pago_Pago",
	},
	{
		id: "midway",
		name: "Samoa Standard Time",
		offset: "-11:00",
		city: "Midway Atoll",
		country: "US Minor Outlying Islands",
		iana: "Pacific/Midway",
	},
	{
		id: "niue",
		name: "Niue Time",
		offset: "-11:00",
		city: "Alofi",
		country: "Niue",
		iana: "Pacific/Niue",
	},
	// UTC-10 Hawaii
	{
		id: "honolulu",
		name: "Hawaii-Aleutian Time",
		offset: "-10:00",
		city: "Honolulu",
		country: "United States",
		iana: "Pacific/Honolulu",
	},
	{
		id: "hilo",
		name: "Hawaii-Aleutian Time",
		offset: "-10:00",
		city: "Hilo",
		country: "United States",
		iana: "Pacific/Honolulu",
	},
	{
		id: "tahiti",
		name: "Tahiti Time",
		offset: "-10:00",
		city: "Papeete",
		country: "French Polynesia",
		iana: "Pacific/Tahiti",
	},
	{
		id: "rarotonga",
		name: "Cook Island Time",
		offset: "-10:00",
		city: "Rarotonga",
		country: "Cook Islands",
		iana: "Pacific/Rarotonga",
	},
	// UTC-9:30
	{
		id: "marquesas",
		name: "Marquesas Time",
		offset: "-09:30",
		city: "Marquesas Islands",
		country: "French Polynesia",
		iana: "Pacific/Marquesas",
	},
	// UTC-9 Alaska
	{
		id: "anchorage",
		name: "Alaska Time",
		offset: "-09:00",
		city: "Anchorage",
		country: "United States",
		iana: "America/Anchorage",
	},
	{
		id: "juneau",
		name: "Alaska Time",
		offset: "-09:00",
		city: "Juneau",
		country: "United States",
		iana: "America/Juneau",
	},
	{
		id: "fairbanks",
		name: "Alaska Time",
		offset: "-09:00",
		city: "Fairbanks",
		country: "United States",
		iana: "America/Anchorage",
	},
	{
		id: "sitka",
		name: "Alaska Time",
		offset: "-09:00",
		city: "Sitka",
		country: "United States",
		iana: "America/Sitka",
	},
	// UTC-8 Pacific
	{
		id: "los-angeles",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Los Angeles",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "san-francisco",
		name: "Pacific Time",
		offset: "-08:00",
		city: "San Francisco",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "seattle",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Seattle",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "portland",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Portland",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "san-diego",
		name: "Pacific Time",
		offset: "-08:00",
		city: "San Diego",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "las-vegas",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Las Vegas",
		country: "United States",
		iana: "America/Los_Angeles",
	},
	{
		id: "vancouver",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Vancouver",
		country: "Canada",
		iana: "America/Vancouver",
	},
	{
		id: "tijuana",
		name: "Pacific Time",
		offset: "-08:00",
		city: "Tijuana",
		country: "Mexico",
		iana: "America/Tijuana",
	},
	// UTC-7 Mountain
	{
		id: "denver",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Denver",
		country: "United States",
		iana: "America/Denver",
	},
	{
		id: "phoenix",
		name: "Mountain Standard Time",
		offset: "-07:00",
		city: "Phoenix",
		country: "United States",
		iana: "America/Phoenix",
	},
	{
		id: "salt-lake-city",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Salt Lake City",
		country: "United States",
		iana: "America/Denver",
	},
	{
		id: "albuquerque",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Albuquerque",
		country: "United States",
		iana: "America/Denver",
	},
	{
		id: "calgary",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Calgary",
		country: "Canada",
		iana: "America/Edmonton",
	},
	{
		id: "edmonton",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Edmonton",
		country: "Canada",
		iana: "America/Edmonton",
	},
	{
		id: "chihuahua",
		name: "Mountain Time",
		offset: "-07:00",
		city: "Chihuahua",
		country: "Mexico",
		iana: "America/Chihuahua",
	},
	{
		id: "hermosillo",
		name: "Mexican Pacific Time",
		offset: "-07:00",
		city: "Hermosillo",
		country: "Mexico",
		iana: "America/Hermosillo",
	},
	// UTC-6 Central
	{
		id: "chicago",
		name: "Central Time",
		offset: "-06:00",
		city: "Chicago",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "houston",
		name: "Central Time",
		offset: "-06:00",
		city: "Houston",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "dallas",
		name: "Central Time",
		offset: "-06:00",
		city: "Dallas",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "austin",
		name: "Central Time",
		offset: "-06:00",
		city: "Austin",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "san-antonio",
		name: "Central Time",
		offset: "-06:00",
		city: "San Antonio",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "memphis",
		name: "Central Time",
		offset: "-06:00",
		city: "Memphis",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "new-orleans",
		name: "Central Time",
		offset: "-06:00",
		city: "New Orleans",
		country: "United States",
		iana: "America/Chicago",
	},
	{
		id: "mexico-city",
		name: "Central Time",
		offset: "-06:00",
		city: "Mexico City",
		country: "Mexico",
		iana: "America/Mexico_City",
	},
	{
		id: "guadalajara",
		name: "Central Time",
		offset: "-06:00",
		city: "Guadalajara",
		country: "Mexico",
		iana: "America/Mexico_City",
	},
	{
		id: "monterrey",
		name: "Central Time",
		offset: "-06:00",
		city: "Monterrey",
		country: "Mexico",
		iana: "America/Monterrey",
	},
	{
		id: "cancun",
		name: "Eastern Standard Time",
		offset: "-05:00",
		city: "Cancún",
		country: "Mexico",
		iana: "America/Cancun",
	},
	{
		id: "winnipeg",
		name: "Central Time",
		offset: "-06:00",
		city: "Winnipeg",
		country: "Canada",
		iana: "America/Winnipeg",
	},
	{
		id: "guatemala-city",
		name: "Central Time",
		offset: "-06:00",
		city: "Guatemala City",
		country: "Guatemala",
		iana: "America/Guatemala",
	},
	{
		id: "san-salvador",
		name: "Central Time",
		offset: "-06:00",
		city: "San Salvador",
		country: "El Salvador",
		iana: "America/El_Salvador",
	},
	{
		id: "tegucigalpa",
		name: "Central Time",
		offset: "-06:00",
		city: "Tegucigalpa",
		country: "Honduras",
		iana: "America/Tegucigalpa",
	},
	{
		id: "managua",
		name: "Central Time",
		offset: "-06:00",
		city: "Managua",
		country: "Nicaragua",
		iana: "America/Managua",
	},
	{
		id: "san-jose-cr",
		name: "Central Time",
		offset: "-06:00",
		city: "San José",
		country: "Costa Rica",
		iana: "America/Costa_Rica",
	},
	{
		id: "belize-city",
		name: "Central Time",
		offset: "-06:00",
		city: "Belize City",
		country: "Belize",
		iana: "America/Belize",
	},
	// UTC-5 Eastern
	{
		id: "new-york",
		name: "Eastern Time",
		offset: "-05:00",
		city: "New York",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "miami",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Miami",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "atlanta",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Atlanta",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "boston",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Boston",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "philadelphia",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Philadelphia",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "washington-dc",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Washington D.C.",
		country: "United States",
		iana: "America/New_York",
	},
	{
		id: "detroit",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Detroit",
		country: "United States",
		iana: "America/Detroit",
	},
	{
		id: "toronto",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Toronto",
		country: "Canada",
		iana: "America/Toronto",
	},
	{
		id: "montreal",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Montreal",
		country: "Canada",
		iana: "America/Montreal",
	},
	{
		id: "ottawa",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Ottawa",
		country: "Canada",
		iana: "America/Toronto",
	},
	{
		id: "havana",
		name: "Cuba Time",
		offset: "-05:00",
		city: "Havana",
		country: "Cuba",
		iana: "America/Havana",
	},
	{
		id: "kingston",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Kingston",
		country: "Jamaica",
		iana: "America/Jamaica",
	},
	{
		id: "bogota",
		name: "Colombia Time",
		offset: "-05:00",
		city: "Bogotá",
		country: "Colombia",
		iana: "America/Bogota",
	},
	{
		id: "lima",
		name: "Peru Time",
		offset: "-05:00",
		city: "Lima",
		country: "Peru",
		iana: "America/Lima",
	},
	{
		id: "quito",
		name: "Ecuador Time",
		offset: "-05:00",
		city: "Quito",
		country: "Ecuador",
		iana: "America/Guayaquil",
	},
	{
		id: "panama-city",
		name: "Eastern Time",
		offset: "-05:00",
		city: "Panama City",
		country: "Panama",
		iana: "America/Panama",
	},
	// UTC-4 Atlantic
	{
		id: "halifax",
		name: "Atlantic Time",
		offset: "-04:00",
		city: "Halifax",
		country: "Canada",
		iana: "America/Halifax",
	},
	{
		id: "santo-domingo",
		name: "Atlantic Time",
		offset: "-04:00",
		city: "Santo Domingo",
		country: "Dominican Republic",
		iana: "America/Santo_Domingo",
	},
	{
		id: "san-juan",
		name: "Atlantic Time",
		offset: "-04:00",
		city: "San Juan",
		country: "Puerto Rico",
		iana: "America/Puerto_Rico",
	},
	{
		id: "caracas",
		name: "Venezuela Time",
		offset: "-04:00",
		city: "Caracas",
		country: "Venezuela",
		iana: "America/Caracas",
	},
	{
		id: "la-paz",
		name: "Bolivia Time",
		offset: "-04:00",
		city: "La Paz",
		country: "Bolivia",
		iana: "America/La_Paz",
	},
	{
		id: "santiago",
		name: "Chile Time",
		offset: "-04:00",
		city: "Santiago",
		country: "Chile",
		iana: "America/Santiago",
	},
	{
		id: "asuncion",
		name: "Paraguay Time",
		offset: "-04:00",
		city: "Asunción",
		country: "Paraguay",
		iana: "America/Asuncion",
	},
	{
		id: "port-of-spain",
		name: "Atlantic Time",
		offset: "-04:00",
		city: "Port of Spain",
		country: "Trinidad and Tobago",
		iana: "America/Port_of_Spain",
	},
	{
		id: "barbados",
		name: "Atlantic Time",
		offset: "-04:00",
		city: "Bridgetown",
		country: "Barbados",
		iana: "America/Barbados",
	},
	{
		id: "manaus",
		name: "Amazon Time",
		offset: "-04:00",
		city: "Manaus",
		country: "Brazil",
		iana: "America/Manaus",
	},
	{
		id: "guyana",
		name: "Guyana Time",
		offset: "-04:00",
		city: "Georgetown",
		country: "Guyana",
		iana: "America/Guyana",
	},
	// UTC-3:30 Newfoundland
	{
		id: "st-johns",
		name: "Newfoundland Time",
		offset: "-03:30",
		city: "St. John's",
		country: "Canada",
		iana: "America/St_Johns",
	},
	// UTC-3 South America
	{
		id: "sao-paulo",
		name: "Brasília Time",
		offset: "-03:00",
		city: "São Paulo",
		country: "Brazil",
		iana: "America/Sao_Paulo",
	},
	{
		id: "rio-de-janeiro",
		name: "Brasília Time",
		offset: "-03:00",
		city: "Rio de Janeiro",
		country: "Brazil",
		iana: "America/Sao_Paulo",
	},
	{
		id: "brasilia",
		name: "Brasília Time",
		offset: "-03:00",
		city: "Brasília",
		country: "Brazil",
		iana: "America/Sao_Paulo",
	},
	{
		id: "buenos-aires",
		name: "Argentina Time",
		offset: "-03:00",
		city: "Buenos Aires",
		country: "Argentina",
		iana: "America/Argentina/Buenos_Aires",
	},
	{
		id: "cordoba",
		name: "Argentina Time",
		offset: "-03:00",
		city: "Córdoba",
		country: "Argentina",
		iana: "America/Argentina/Cordoba",
	},
	{
		id: "montevideo",
		name: "Uruguay Time",
		offset: "-03:00",
		city: "Montevideo",
		country: "Uruguay",
		iana: "America/Montevideo",
	},
	{
		id: "salvador",
		name: "Brasília Time",
		offset: "-03:00",
		city: "Salvador",
		country: "Brazil",
		iana: "America/Bahia",
	},
	{
		id: "fortaleza",
		name: "Brasília Time",
		offset: "-03:00",
		city: "Fortaleza",
		country: "Brazil",
		iana: "America/Fortaleza",
	},
	{
		id: "recife",
		name: "Brasília Time",
		offset: "-03:00",
		city: "Recife",
		country: "Brazil",
		iana: "America/Recife",
	},
	{
		id: "paramaribo",
		name: "Suriname Time",
		offset: "-03:00",
		city: "Paramaribo",
		country: "Suriname",
		iana: "America/Paramaribo",
	},
	{
		id: "cayenne",
		name: "French Guiana Time",
		offset: "-03:00",
		city: "Cayenne",
		country: "French Guiana",
		iana: "America/Cayenne",
	},
	// UTC-2
	{
		id: "fernando-noronha",
		name: "Fernando de Noronha Time",
		offset: "-02:00",
		city: "Fernando de Noronha",
		country: "Brazil",
		iana: "America/Noronha",
	},
	{
		id: "south-georgia",
		name: "South Georgia Time",
		offset: "-02:00",
		city: "Grytviken",
		country: "South Georgia",
		iana: "Atlantic/South_Georgia",
	},
	// UTC-1
	{
		id: "azores",
		name: "Azores Time",
		offset: "-01:00",
		city: "Ponta Delgada",
		country: "Portugal",
		iana: "Atlantic/Azores",
	},
	{
		id: "cape-verde",
		name: "Cape Verde Time",
		offset: "-01:00",
		city: "Praia",
		country: "Cape Verde",
		iana: "Atlantic/Cape_Verde",
	},
	// UTC+0 GMT/WET
	{
		id: "utc",
		name: "Coordinated Universal Time",
		offset: "+00:00",
		city: "UTC",
		country: "Universal",
		iana: "UTC",
	},
	{
		id: "london",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "London",
		country: "United Kingdom",
		iana: "Europe/London",
	},
	{
		id: "dublin",
		name: "Irish Standard Time",
		offset: "+00:00",
		city: "Dublin",
		country: "Ireland",
		iana: "Europe/Dublin",
	},
	{
		id: "lisbon",
		name: "Western European Time",
		offset: "+00:00",
		city: "Lisbon",
		country: "Portugal",
		iana: "Europe/Lisbon",
	},
	{
		id: "reykjavik",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "Reykjavik",
		country: "Iceland",
		iana: "Atlantic/Reykjavik",
	},
	{
		id: "casablanca",
		name: "Western European Time",
		offset: "+00:00",
		city: "Casablanca",
		country: "Morocco",
		iana: "Africa/Casablanca",
	},
	{
		id: "dakar",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "Dakar",
		country: "Senegal",
		iana: "Africa/Dakar",
	},
	{
		id: "accra",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "Accra",
		country: "Ghana",
		iana: "Africa/Accra",
	},
	{
		id: "abidjan",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "Abidjan",
		country: "Côte d'Ivoire",
		iana: "Africa/Abidjan",
	},
	{
		id: "monrovia",
		name: "Greenwich Mean Time",
		offset: "+00:00",
		city: "Monrovia",
		country: "Liberia",
		iana: "Africa/Monrovia",
	},
	// UTC+1 CET
	{
		id: "paris",
		name: "Central European Time",
		offset: "+01:00",
		city: "Paris",
		country: "France",
		iana: "Europe/Paris",
	},
	{
		id: "berlin",
		name: "Central European Time",
		offset: "+01:00",
		city: "Berlin",
		country: "Germany",
		iana: "Europe/Berlin",
	},
	{
		id: "madrid",
		name: "Central European Time",
		offset: "+01:00",
		city: "Madrid",
		country: "Spain",
		iana: "Europe/Madrid",
	},
	{
		id: "barcelona",
		name: "Central European Time",
		offset: "+01:00",
		city: "Barcelona",
		country: "Spain",
		iana: "Europe/Madrid",
	},
	{
		id: "rome",
		name: "Central European Time",
		offset: "+01:00",
		city: "Rome",
		country: "Italy",
		iana: "Europe/Rome",
	},
	{
		id: "milan",
		name: "Central European Time",
		offset: "+01:00",
		city: "Milan",
		country: "Italy",
		iana: "Europe/Rome",
	},
	{
		id: "amsterdam",
		name: "Central European Time",
		offset: "+01:00",
		city: "Amsterdam",
		country: "Netherlands",
		iana: "Europe/Amsterdam",
	},
	{
		id: "brussels",
		name: "Central European Time",
		offset: "+01:00",
		city: "Brussels",
		country: "Belgium",
		iana: "Europe/Brussels",
	},
	{
		id: "vienna",
		name: "Central European Time",
		offset: "+01:00",
		city: "Vienna",
		country: "Austria",
		iana: "Europe/Vienna",
	},
	{
		id: "zurich",
		name: "Central European Time",
		offset: "+01:00",
		city: "Zurich",
		country: "Switzerland",
		iana: "Europe/Zurich",
	},
	{
		id: "geneva",
		name: "Central European Time",
		offset: "+01:00",
		city: "Geneva",
		country: "Switzerland",
		iana: "Europe/Zurich",
	},
	{
		id: "stockholm",
		name: "Central European Time",
		offset: "+01:00",
		city: "Stockholm",
		country: "Sweden",
		iana: "Europe/Stockholm",
	},
	{
		id: "oslo",
		name: "Central European Time",
		offset: "+01:00",
		city: "Oslo",
		country: "Norway",
		iana: "Europe/Oslo",
	},
	{
		id: "copenhagen",
		name: "Central European Time",
		offset: "+01:00",
		city: "Copenhagen",
		country: "Denmark",
		iana: "Europe/Copenhagen",
	},
	{
		id: "warsaw",
		name: "Central European Time",
		offset: "+01:00",
		city: "Warsaw",
		country: "Poland",
		iana: "Europe/Warsaw",
	},
	{
		id: "prague",
		name: "Central European Time",
		offset: "+01:00",
		city: "Prague",
		country: "Czech Republic",
		iana: "Europe/Prague",
	},
	{
		id: "budapest",
		name: "Central European Time",
		offset: "+01:00",
		city: "Budapest",
		country: "Hungary",
		iana: "Europe/Budapest",
	},
	{
		id: "belgrade",
		name: "Central European Time",
		offset: "+01:00",
		city: "Belgrade",
		country: "Serbia",
		iana: "Europe/Belgrade",
	},
	{
		id: "algiers",
		name: "Central European Time",
		offset: "+01:00",
		city: "Algiers",
		country: "Algeria",
		iana: "Africa/Algiers",
	},
	{
		id: "tunis",
		name: "Central European Time",
		offset: "+01:00",
		city: "Tunis",
		country: "Tunisia",
		iana: "Africa/Tunis",
	},
	{
		id: "lagos",
		name: "West Africa Time",
		offset: "+01:00",
		city: "Lagos",
		country: "Nigeria",
		iana: "Africa/Lagos",
	},
	{
		id: "kinshasa",
		name: "West Africa Time",
		offset: "+01:00",
		city: "Kinshasa",
		country: "DR Congo",
		iana: "Africa/Kinshasa",
	},
	{
		id: "luanda",
		name: "West Africa Time",
		offset: "+01:00",
		city: "Luanda",
		country: "Angola",
		iana: "Africa/Luanda",
	},
	// UTC+2 EET
	{
		id: "athens",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Athens",
		country: "Greece",
		iana: "Europe/Athens",
	},
	{
		id: "cairo",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Cairo",
		country: "Egypt",
		iana: "Africa/Cairo",
	},
	{
		id: "johannesburg",
		name: "South Africa Time",
		offset: "+02:00",
		city: "Johannesburg",
		country: "South Africa",
		iana: "Africa/Johannesburg",
	},
	{
		id: "cape-town",
		name: "South Africa Time",
		offset: "+02:00",
		city: "Cape Town",
		country: "South Africa",
		iana: "Africa/Johannesburg",
	},
	{
		id: "helsinki",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Helsinki",
		country: "Finland",
		iana: "Europe/Helsinki",
	},
	{
		id: "bucharest",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Bucharest",
		country: "Romania",
		iana: "Europe/Bucharest",
	},
	{
		id: "sofia",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Sofia",
		country: "Bulgaria",
		iana: "Europe/Sofia",
	},
	{
		id: "kyiv",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Kyiv",
		country: "Ukraine",
		iana: "Europe/Kyiv",
	},
	{
		id: "istanbul",
		name: "Turkey Time",
		offset: "+03:00",
		city: "Istanbul",
		country: "Turkey",
		iana: "Europe/Istanbul",
	},
	{
		id: "tel-aviv",
		name: "Israel Time",
		offset: "+02:00",
		city: "Tel Aviv",
		country: "Israel",
		iana: "Asia/Tel_Aviv",
	},
	{
		id: "jerusalem",
		name: "Israel Time",
		offset: "+02:00",
		city: "Jerusalem",
		country: "Israel",
		iana: "Asia/Jerusalem",
	},
	{
		id: "beirut",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Beirut",
		country: "Lebanon",
		iana: "Asia/Beirut",
	},
	{
		id: "amman",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Amman",
		country: "Jordan",
		iana: "Asia/Amman",
	},
	{
		id: "harare",
		name: "Central Africa Time",
		offset: "+02:00",
		city: "Harare",
		country: "Zimbabwe",
		iana: "Africa/Harare",
	},
	{
		id: "maputo",
		name: "Central Africa Time",
		offset: "+02:00",
		city: "Maputo",
		country: "Mozambique",
		iana: "Africa/Maputo",
	},
	{
		id: "nairobi",
		name: "East Africa Time",
		offset: "+03:00",
		city: "Nairobi",
		country: "Kenya",
		iana: "Africa/Nairobi",
	},
	{
		id: "tripoli",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Tripoli",
		country: "Libya",
		iana: "Africa/Tripoli",
	},
	{
		id: "riga",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Riga",
		country: "Latvia",
		iana: "Europe/Riga",
	},
	{
		id: "tallinn",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Tallinn",
		country: "Estonia",
		iana: "Europe/Tallinn",
	},
	{
		id: "vilnius",
		name: "Eastern European Time",
		offset: "+02:00",
		city: "Vilnius",
		country: "Lithuania",
		iana: "Europe/Vilnius",
	},
	// UTC+3
	{
		id: "moscow",
		name: "Moscow Time",
		offset: "+03:00",
		city: "Moscow",
		country: "Russia",
		iana: "Europe/Moscow",
	},
	{
		id: "st-petersburg",
		name: "Moscow Time",
		offset: "+03:00",
		city: "Saint Petersburg",
		country: "Russia",
		iana: "Europe/Moscow",
	},
	{
		id: "minsk",
		name: "Moscow Time",
		offset: "+03:00",
		city: "Minsk",
		country: "Belarus",
		iana: "Europe/Minsk",
	},
	{
		id: "riyadh",
		name: "Arabia Time",
		offset: "+03:00",
		city: "Riyadh",
		country: "Saudi Arabia",
		iana: "Asia/Riyadh",
	},
	{
		id: "jeddah",
		name: "Arabia Time",
		offset: "+03:00",
		city: "Jeddah",
		country: "Saudi Arabia",
		iana: "Asia/Riyadh",
	},
	{
		id: "kuwait-city",
		name: "Arabia Time",
		offset: "+03:00",
		city: "Kuwait City",
		country: "Kuwait",
		iana: "Asia/Kuwait",
	},
	{
		id: "doha",
		name: "Arabia Time",
		offset: "+03:00",
		city: "Doha",
		country: "Qatar",
		iana: "Asia/Qatar",
	},
	{
		id: "baghdad",
		name: "Arabia Time",
		offset: "+03:00",
		city: "Baghdad",
		country: "Iraq",
		iana: "Asia/Baghdad",
	},
	{
		id: "addis-ababa",
		name: "East Africa Time",
		offset: "+03:00",
		city: "Addis Ababa",
		country: "Ethiopia",
		iana: "Africa/Addis_Ababa",
	},
	{
		id: "dar-es-salaam",
		name: "East Africa Time",
		offset: "+03:00",
		city: "Dar es Salaam",
		country: "Tanzania",
		iana: "Africa/Dar_es_Salaam",
	},
	{
		id: "kampala",
		name: "East Africa Time",
		offset: "+03:00",
		city: "Kampala",
		country: "Uganda",
		iana: "Africa/Kampala",
	},
	{
		id: "antananarivo",
		name: "East Africa Time",
		offset: "+03:00",
		city: "Antananarivo",
		country: "Madagascar",
		iana: "Indian/Antananarivo",
	},
	// UTC+3:30
	{
		id: "tehran",
		name: "Iran Time",
		offset: "+03:30",
		city: "Tehran",
		country: "Iran",
		iana: "Asia/Tehran",
	},
	// UTC+4
	{
		id: "dubai",
		name: "Gulf Standard Time",
		offset: "+04:00",
		city: "Dubai",
		country: "United Arab Emirates",
		iana: "Asia/Dubai",
	},
	{
		id: "abu-dhabi",
		name: "Gulf Standard Time",
		offset: "+04:00",
		city: "Abu Dhabi",
		country: "United Arab Emirates",
		iana: "Asia/Dubai",
	},
	{
		id: "muscat",
		name: "Gulf Standard Time",
		offset: "+04:00",
		city: "Muscat",
		country: "Oman",
		iana: "Asia/Muscat",
	},
	{
		id: "baku",
		name: "Azerbaijan Time",
		offset: "+04:00",
		city: "Baku",
		country: "Azerbaijan",
		iana: "Asia/Baku",
	},
	{
		id: "tbilisi",
		name: "Georgia Time",
		offset: "+04:00",
		city: "Tbilisi",
		country: "Georgia",
		iana: "Asia/Tbilisi",
	},
	{
		id: "yerevan",
		name: "Armenia Time",
		offset: "+04:00",
		city: "Yerevan",
		country: "Armenia",
		iana: "Asia/Yerevan",
	},
	{
		id: "mauritius",
		name: "Mauritius Time",
		offset: "+04:00",
		city: "Port Louis",
		country: "Mauritius",
		iana: "Indian/Mauritius",
	},
	{
		id: "samara",
		name: "Samara Time",
		offset: "+04:00",
		city: "Samara",
		country: "Russia",
		iana: "Europe/Samara",
	},
	// UTC+4:30
	{
		id: "kabul",
		name: "Afghanistan Time",
		offset: "+04:30",
		city: "Kabul",
		country: "Afghanistan",
		iana: "Asia/Kabul",
	},
	// UTC+5
	{
		id: "karachi",
		name: "Pakistan Time",
		offset: "+05:00",
		city: "Karachi",
		country: "Pakistan",
		iana: "Asia/Karachi",
	},
	{
		id: "lahore",
		name: "Pakistan Time",
		offset: "+05:00",
		city: "Lahore",
		country: "Pakistan",
		iana: "Asia/Karachi",
	},
	{
		id: "islamabad",
		name: "Pakistan Time",
		offset: "+05:00",
		city: "Islamabad",
		country: "Pakistan",
		iana: "Asia/Karachi",
	},
	{
		id: "tashkent",
		name: "Uzbekistan Time",
		offset: "+05:00",
		city: "Tashkent",
		country: "Uzbekistan",
		iana: "Asia/Tashkent",
	},
	{
		id: "dushanbe",
		name: "Tajikistan Time",
		offset: "+05:00",
		city: "Dushanbe",
		country: "Tajikistan",
		iana: "Asia/Dushanbe",
	},
	{
		id: "ashgabat",
		name: "Turkmenistan Time",
		offset: "+05:00",
		city: "Ashgabat",
		country: "Turkmenistan",
		iana: "Asia/Ashgabat",
	},
	{
		id: "maldives",
		name: "Maldives Time",
		offset: "+05:00",
		city: "Malé",
		country: "Maldives",
		iana: "Indian/Maldives",
	},
	{
		id: "yekaterinburg",
		name: "Yekaterinburg Time",
		offset: "+05:00",
		city: "Yekaterinburg",
		country: "Russia",
		iana: "Asia/Yekaterinburg",
	},
	// UTC+5:30
	{
		id: "mumbai",
		name: "India Standard Time",
		offset: "+05:30",
		city: "Mumbai",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "delhi",
		name: "India Standard Time",
		offset: "+05:30",
		city: "New Delhi",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "bangalore",
		name: "India Standard Time",
		offset: "+05:30",
		city: "Bangalore",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "chennai",
		name: "India Standard Time",
		offset: "+05:30",
		city: "Chennai",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "kolkata",
		name: "India Standard Time",
		offset: "+05:30",
		city: "Kolkata",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "hyderabad",
		name: "India Standard Time",
		offset: "+05:30",
		city: "Hyderabad",
		country: "India",
		iana: "Asia/Kolkata",
	},
	{
		id: "colombo",
		name: "Sri Lanka Time",
		offset: "+05:30",
		city: "Colombo",
		country: "Sri Lanka",
		iana: "Asia/Colombo",
	},
	// UTC+5:45
	{
		id: "kathmandu",
		name: "Nepal Time",
		offset: "+05:45",
		city: "Kathmandu",
		country: "Nepal",
		iana: "Asia/Kathmandu",
	},
	// UTC+6
	{
		id: "dhaka",
		name: "Bangladesh Time",
		offset: "+06:00",
		city: "Dhaka",
		country: "Bangladesh",
		iana: "Asia/Dhaka",
	},
	{
		id: "almaty",
		name: "Almaty Time",
		offset: "+06:00",
		city: "Almaty",
		country: "Kazakhstan",
		iana: "Asia/Almaty",
	},
	{
		id: "astana",
		name: "Astana Time",
		offset: "+06:00",
		city: "Astana",
		country: "Kazakhstan",
		iana: "Asia/Almaty",
	},
	{
		id: "bishkek",
		name: "Kyrgyzstan Time",
		offset: "+06:00",
		city: "Bishkek",
		country: "Kyrgyzstan",
		iana: "Asia/Bishkek",
	},
	{
		id: "thimphu",
		name: "Bhutan Time",
		offset: "+06:00",
		city: "Thimphu",
		country: "Bhutan",
		iana: "Asia/Thimphu",
	},
	{
		id: "omsk",
		name: "Omsk Time",
		offset: "+06:00",
		city: "Omsk",
		country: "Russia",
		iana: "Asia/Omsk",
	},
	// UTC+6:30
	{
		id: "yangon",
		name: "Myanmar Time",
		offset: "+06:30",
		city: "Yangon",
		country: "Myanmar",
		iana: "Asia/Yangon",
	},
	{
		id: "cocos",
		name: "Cocos Islands Time",
		offset: "+06:30",
		city: "Cocos Islands",
		country: "Australia",
		iana: "Indian/Cocos",
	},
	// UTC+7
	{
		id: "bangkok",
		name: "Indochina Time",
		offset: "+07:00",
		city: "Bangkok",
		country: "Thailand",
		iana: "Asia/Bangkok",
	},
	{
		id: "hanoi",
		name: "Indochina Time",
		offset: "+07:00",
		city: "Hanoi",
		country: "Vietnam",
		iana: "Asia/Ho_Chi_Minh",
	},
	{
		id: "ho-chi-minh",
		name: "Indochina Time",
		offset: "+07:00",
		city: "Ho Chi Minh City",
		country: "Vietnam",
		iana: "Asia/Ho_Chi_Minh",
	},
	{
		id: "jakarta",
		name: "Western Indonesia Time",
		offset: "+07:00",
		city: "Jakarta",
		country: "Indonesia",
		iana: "Asia/Jakarta",
	},
	{
		id: "phnom-penh",
		name: "Indochina Time",
		offset: "+07:00",
		city: "Phnom Penh",
		country: "Cambodia",
		iana: "Asia/Phnom_Penh",
	},
	{
		id: "vientiane",
		name: "Indochina Time",
		offset: "+07:00",
		city: "Vientiane",
		country: "Laos",
		iana: "Asia/Vientiane",
	},
	{
		id: "krasnoyarsk",
		name: "Krasnoyarsk Time",
		offset: "+07:00",
		city: "Krasnoyarsk",
		country: "Russia",
		iana: "Asia/Krasnoyarsk",
	},
	// UTC+8
	{
		id: "beijing",
		name: "China Standard Time",
		offset: "+08:00",
		city: "Beijing",
		country: "China",
		iana: "Asia/Shanghai",
	},
	{
		id: "shanghai",
		name: "China Standard Time",
		offset: "+08:00",
		city: "Shanghai",
		country: "China",
		iana: "Asia/Shanghai",
	},
	{
		id: "hong-kong",
		name: "Hong Kong Time",
		offset: "+08:00",
		city: "Hong Kong",
		country: "China",
		iana: "Asia/Hong_Kong",
	},
	{
		id: "taipei",
		name: "Taiwan Time",
		offset: "+08:00",
		city: "Taipei",
		country: "Taiwan",
		iana: "Asia/Taipei",
	},
	{
		id: "singapore",
		name: "Singapore Time",
		offset: "+08:00",
		city: "Singapore",
		country: "Singapore",
		iana: "Asia/Singapore",
	},
	{
		id: "kuala-lumpur",
		name: "Malaysia Time",
		offset: "+08:00",
		city: "Kuala Lumpur",
		country: "Malaysia",
		iana: "Asia/Kuala_Lumpur",
	},
	{
		id: "manila",
		name: "Philippine Time",
		offset: "+08:00",
		city: "Manila",
		country: "Philippines",
		iana: "Asia/Manila",
	},
	{
		id: "perth",
		name: "Australian Western Time",
		offset: "+08:00",
		city: "Perth",
		country: "Australia",
		iana: "Australia/Perth",
	},
	{
		id: "ulaanbaatar",
		name: "Mongolia Time",
		offset: "+08:00",
		city: "Ulaanbaatar",
		country: "Mongolia",
		iana: "Asia/Ulaanbaatar",
	},
	{
		id: "makassar",
		name: "Central Indonesia Time",
		offset: "+08:00",
		city: "Makassar",
		country: "Indonesia",
		iana: "Asia/Makassar",
	},
	{
		id: "bali",
		name: "Central Indonesia Time",
		offset: "+08:00",
		city: "Denpasar (Bali)",
		country: "Indonesia",
		iana: "Asia/Makassar",
	},
	{
		id: "brunei",
		name: "Brunei Time",
		offset: "+08:00",
		city: "Bandar Seri Begawan",
		country: "Brunei",
		iana: "Asia/Brunei",
	},
	{
		id: "irkutsk",
		name: "Irkutsk Time",
		offset: "+08:00",
		city: "Irkutsk",
		country: "Russia",
		iana: "Asia/Irkutsk",
	},
	// UTC+8:45
	{
		id: "eucla",
		name: "Central Western Time",
		offset: "+08:45",
		city: "Eucla",
		country: "Australia",
		iana: "Australia/Eucla",
	},
	// UTC+9
	{
		id: "tokyo",
		name: "Japan Standard Time",
		offset: "+09:00",
		city: "Tokyo",
		country: "Japan",
		iana: "Asia/Tokyo",
	},
	{
		id: "osaka",
		name: "Japan Standard Time",
		offset: "+09:00",
		city: "Osaka",
		country: "Japan",
		iana: "Asia/Tokyo",
	},
	{
		id: "seoul",
		name: "Korea Standard Time",
		offset: "+09:00",
		city: "Seoul",
		country: "South Korea",
		iana: "Asia/Seoul",
	},
	{
		id: "busan",
		name: "Korea Standard Time",
		offset: "+09:00",
		city: "Busan",
		country: "South Korea",
		iana: "Asia/Seoul",
	},
	{
		id: "pyongyang",
		name: "Pyongyang Time",
		offset: "+09:00",
		city: "Pyongyang",
		country: "North Korea",
		iana: "Asia/Pyongyang",
	},
	{
		id: "jayapura",
		name: "Eastern Indonesia Time",
		offset: "+09:00",
		city: "Jayapura",
		country: "Indonesia",
		iana: "Asia/Jayapura",
	},
	{
		id: "palau",
		name: "Palau Time",
		offset: "+09:00",
		city: "Ngerulmud",
		country: "Palau",
		iana: "Pacific/Palau",
	},
	{
		id: "dili",
		name: "Timor-Leste Time",
		offset: "+09:00",
		city: "Dili",
		country: "Timor-Leste",
		iana: "Asia/Dili",
	},
	{
		id: "yakutsk",
		name: "Yakutsk Time",
		offset: "+09:00",
		city: "Yakutsk",
		country: "Russia",
		iana: "Asia/Yakutsk",
	},
	// UTC+9:30
	{
		id: "darwin",
		name: "Australian Central Time",
		offset: "+09:30",
		city: "Darwin",
		country: "Australia",
		iana: "Australia/Darwin",
	},
	{
		id: "adelaide",
		name: "Australian Central Time",
		offset: "+09:30",
		city: "Adelaide",
		country: "Australia",
		iana: "Australia/Adelaide",
	},
	// UTC+10
	{
		id: "sydney",
		name: "Australian Eastern Time",
		offset: "+10:00",
		city: "Sydney",
		country: "Australia",
		iana: "Australia/Sydney",
	},
	{
		id: "melbourne",
		name: "Australian Eastern Time",
		offset: "+10:00",
		city: "Melbourne",
		country: "Australia",
		iana: "Australia/Melbourne",
	},
	{
		id: "brisbane",
		name: "Australian Eastern Time",
		offset: "+10:00",
		city: "Brisbane",
		country: "Australia",
		iana: "Australia/Brisbane",
	},
	{
		id: "canberra",
		name: "Australian Eastern Time",
		offset: "+10:00",
		city: "Canberra",
		country: "Australia",
		iana: "Australia/Sydney",
	},
	{
		id: "hobart",
		name: "Australian Eastern Time",
		offset: "+10:00",
		city: "Hobart",
		country: "Australia",
		iana: "Australia/Hobart",
	},
	{
		id: "port-moresby",
		name: "Papua New Guinea Time",
		offset: "+10:00",
		city: "Port Moresby",
		country: "Papua New Guinea",
		iana: "Pacific/Port_Moresby",
	},
	{
		id: "guam",
		name: "Chamorro Time",
		offset: "+10:00",
		city: "Hagåtña",
		country: "Guam",
		iana: "Pacific/Guam",
	},
	{
		id: "saipan",
		name: "Chamorro Time",
		offset: "+10:00",
		city: "Saipan",
		country: "Northern Mariana Islands",
		iana: "Pacific/Saipan",
	},
	{
		id: "vladivostok",
		name: "Vladivostok Time",
		offset: "+10:00",
		city: "Vladivostok",
		country: "Russia",
		iana: "Asia/Vladivostok",
	},
	// UTC+10:30
	{
		id: "lord-howe",
		name: "Lord Howe Time",
		offset: "+10:30",
		city: "Lord Howe Island",
		country: "Australia",
		iana: "Australia/Lord_Howe",
	},
	// UTC+11
	{
		id: "noumea",
		name: "New Caledonia Time",
		offset: "+11:00",
		city: "Nouméa",
		country: "New Caledonia",
		iana: "Pacific/Noumea",
	},
	{
		id: "solomons",
		name: "Solomon Islands Time",
		offset: "+11:00",
		city: "Honiara",
		country: "Solomon Islands",
		iana: "Pacific/Guadalcanal",
	},
	{
		id: "vanuatu",
		name: "Vanuatu Time",
		offset: "+11:00",
		city: "Port Vila",
		country: "Vanuatu",
		iana: "Pacific/Efate",
	},
	{
		id: "magadan",
		name: "Magadan Time",
		offset: "+11:00",
		city: "Magadan",
		country: "Russia",
		iana: "Asia/Magadan",
	},
	{
		id: "sakhalin",
		name: "Sakhalin Time",
		offset: "+11:00",
		city: "Yuzhno-Sakhalinsk",
		country: "Russia",
		iana: "Asia/Sakhalin",
	},
	{
		id: "norfolk",
		name: "Norfolk Time",
		offset: "+11:00",
		city: "Kingston",
		country: "Norfolk Island",
		iana: "Pacific/Norfolk",
	},
	{
		id: "kosrae",
		name: "Kosrae Time",
		offset: "+11:00",
		city: "Kosrae",
		country: "Micronesia",
		iana: "Pacific/Kosrae",
	},
	// UTC+12
	{
		id: "auckland",
		name: "New Zealand Time",
		offset: "+12:00",
		city: "Auckland",
		country: "New Zealand",
		iana: "Pacific/Auckland",
	},
	{
		id: "wellington",
		name: "New Zealand Time",
		offset: "+12:00",
		city: "Wellington",
		country: "New Zealand",
		iana: "Pacific/Auckland",
	},
	{
		id: "fiji",
		name: "Fiji Time",
		offset: "+12:00",
		city: "Suva",
		country: "Fiji",
		iana: "Pacific/Fiji",
	},
	{
		id: "kamchatka",
		name: "Kamchatka Time",
		offset: "+12:00",
		city: "Petropavlovsk-Kamchatsky",
		country: "Russia",
		iana: "Asia/Kamchatka",
	},
	{
		id: "marshall",
		name: "Marshall Islands Time",
		offset: "+12:00",
		city: "Majuro",
		country: "Marshall Islands",
		iana: "Pacific/Majuro",
	},
	{
		id: "tarawa",
		name: "Gilbert Islands Time",
		offset: "+12:00",
		city: "Tarawa",
		country: "Kiribati",
		iana: "Pacific/Tarawa",
	},
	{
		id: "funafuti",
		name: "Tuvalu Time",
		offset: "+12:00",
		city: "Funafuti",
		country: "Tuvalu",
		iana: "Pacific/Funafuti",
	},
	{
		id: "nauru",
		name: "Nauru Time",
		offset: "+12:00",
		city: "Yaren",
		country: "Nauru",
		iana: "Pacific/Nauru",
	},
	{
		id: "wake",
		name: "Wake Island Time",
		offset: "+12:00",
		city: "Wake Island",
		country: "US Minor Outlying Islands",
		iana: "Pacific/Wake",
	},
	// UTC+12:45
	{
		id: "chatham",
		name: "Chatham Time",
		offset: "+12:45",
		city: "Chatham Islands",
		country: "New Zealand",
		iana: "Pacific/Chatham",
	},
	// UTC+13
	{
		id: "tonga",
		name: "Tonga Time",
		offset: "+13:00",
		city: "Nukuʻalofa",
		country: "Tonga",
		iana: "Pacific/Tongatapu",
	},
	{
		id: "samoa-west",
		name: "West Samoa Time",
		offset: "+13:00",
		city: "Apia",
		country: "Samoa",
		iana: "Pacific/Apia",
	},
	{
		id: "phoenix-islands",
		name: "Phoenix Islands Time",
		offset: "+13:00",
		city: "Kanton",
		country: "Kiribati",
		iana: "Pacific/Kanton",
	},
	{
		id: "tokelau",
		name: "Tokelau Time",
		offset: "+13:00",
		city: "Atafu",
		country: "Tokelau",
		iana: "Pacific/Fakaofo",
	},
	// UTC+14
	{
		id: "kiritimati",
		name: "Line Islands Time",
		offset: "+14:00",
		city: "Kiritimati",
		country: "Kiribati",
		iana: "Pacific/Kiritimati",
	},
];

function formatTimeWithIANA(date: Date, ianaTimezone: string): string {
	try {
		return date.toLocaleTimeString("en-US", {
			timeZone: ianaTimezone,
			hour: "2-digit",
			minute: "2-digit",
			hour12: true,
		});
	} catch {
		return "--:--";
	}
}

function getCurrentOffset(ianaTimezone: string): string {
	try {
		const now = new Date();
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: ianaTimezone,
			timeZoneName: "shortOffset",
		});
		const parts = formatter.formatToParts(now);
		const offsetPart = parts.find((p) => p.type === "timeZoneName");
		if (offsetPart) {
			const match = offsetPart.value.match(/GMT([+-]?)(\d+)?(?::(\d+))?/);
			if (match) {
				const sign = match[1] || "+";
				const hours = match[2] ? match[2].padStart(2, "0") : "00";
				const minutes = match[3] ? match[3].padStart(2, "0") : "00";
				return `${sign}${hours}:${minutes}`;
			}
		}
		return "+00:00";
	} catch {
		return "+00:00";
	}
}

function getUserTimezone(): string {
	try {
		return Intl.DateTimeFormat().resolvedOptions().timeZone;
	} catch {
		return "UTC";
	}
}

function getTimeDifference(fromIana: string, toIana: string): string {
	try {
		const now = new Date();
		const fromTime = new Date(
			now.toLocaleString("en-US", { timeZone: fromIana }),
		);
		const toTime = new Date(now.toLocaleString("en-US", { timeZone: toIana }));
		const diffMs = toTime.getTime() - fromTime.getTime();
		const diffHours = diffMs / (1000 * 60 * 60);

		if (diffHours === 0) return "same time";
		const sign = diffHours > 0 ? "+" : "";
		const absHours = Math.abs(diffHours);
		if (absHours % 1 === 0) {
			return `${sign}${diffHours}h`;
		}
		const hours = Math.floor(absHours);
		const minutes = Math.round((absHours % 1) * 60);
		return `${sign}${diffHours > 0 ? hours : -hours}:${minutes.toString().padStart(2, "0")}`;
	} catch {
		return "";
	}
}

function findTimezoneByIana(iana: string): Timezone | null {
	return timezones.find((tz) => tz.iana === iana) || null;
}

interface TimezonePickerProps {
	value?: string;
	onChange?: (timezone: string) => void;
	className?: string;
	disabled?: boolean;
}

export function TimezonePicker({
	value,
	onChange,
	className,
	disabled,
}: TimezonePickerProps) {
	const { t } = useLanguage();
	const [open, setOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const userTimezone = useMemo(() => getUserTimezone(), []);

	const selectedTimezone = useMemo(
		() => (value ? findTimezoneByIana(value) : null),
		[value],
	);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000); // Update every minute
		return () => clearInterval(interval);
	}, []);

	const handleSelect = (iana: string) => {
		onChange?.(iana);
		setOpen(false);
	};

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					className={cn(
						"h-auto w-fit min-w-[220px] justify-between px-4 py-3",
						!selectedTimezone && "text-muted-foreground",
						className,
					)}
				>
					<div className="flex flex-col items-start gap-1">
						<span className="text-sm font-medium leading-none">
							{selectedTimezone
								? selectedTimezone.city
								: t("timezone.selectTimezone")}
						</span>
						{selectedTimezone && (
							<span className="text-xs text-muted-foreground leading-none">
								{formatTimeWithIANA(currentTime, selectedTimezone.iana)}
								<span className="mx-1.5">·</span>
								UTC{getCurrentOffset(selectedTimezone.iana)}
								{userTimezone !== selectedTimezone.iana && (
									<span className="ml-1.5 text-primary">
										({getTimeDifference(userTimezone, selectedTimezone.iana)})
									</span>
								)}
							</span>
						)}
					</div>
					<ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[320px] p-0" align="start">
				<Command>
					<CommandInput placeholder={t("timezone.searchTimezones")} />
					<CommandList>
						<CommandEmpty>
							<div className="flex flex-col items-center gap-2 py-4">
								<Clock className="h-8 w-8 text-muted-foreground" />
								<p className="text-sm text-muted-foreground">
									{t("timezone.noResults")}
								</p>
							</div>
						</CommandEmpty>
						<CommandGroup>
							{timezones.map((tz) => (
								<CommandItem
									key={tz.id}
									value={`${tz.city} ${tz.country} ${tz.name} ${tz.iana}`}
									onSelect={() => handleSelect(tz.iana)}
									className="flex items-center justify-between"
								>
									<div className="flex items-center gap-2">
										<Check
											className={cn(
												"h-4 w-4",
												selectedTimezone?.iana === tz.iana
													? "opacity-100"
													: "opacity-0",
											)}
										/>
										<div className="flex flex-col">
											<span className="text-sm font-medium">{tz.city}</span>
											<span className="text-xs text-muted-foreground">
												{tz.country}
											</span>
										</div>
									</div>
									<div className="flex flex-col items-end">
										<span className="text-sm tabular-nums">
											{formatTimeWithIANA(currentTime, tz.iana)}
										</span>
										<span className="text-xs text-muted-foreground tabular-nums">
											UTC{getCurrentOffset(tz.iana)}
										</span>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

// Export helper functions for use in other components
export {
	timezones,
	formatTimeWithIANA,
	getCurrentOffset,
	getUserTimezone,
	getTimeDifference,
	findTimezoneByIana,
};
export type { Timezone };
