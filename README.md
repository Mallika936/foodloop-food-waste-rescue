# FoodLoop — Food Waste Rescue

## Build 2026 submission

- **Project:** FoodLoop — Food Waste Rescue
- **Team lead:** Mallika Debnath
- **Built with:** Agent37 Personal Agent, instance `cyco352lzc`
- **Data:** Sample data only. No real personal data, no integrations, no paid plan, and no separate web demo published yet.

## The problem

Restaurants, hostels, and bakeries often discard surplus edible food while nearby communities face food insecurity.

## What FoodLoop does

FoodLoop is a small, sample browser app that lists surplus food, matches it with nearby sample NGOs/recipients by area and food type, schedules pickups, and tracks delivery status.

## Files

- `index.html` — the page structure
- `styles.css` — the styling
- `app.js` — listings, matching, the pickup schedule, and status tracking
- `README.md` — this guide

## Run locally

Open `index.html` directly in a browser, or run a local server from the project folder:

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Input

Use the add-listing form to enter:

- Food type
- Quantity
- Location area
- Available-until / pickup-window date and time
- Optional pickup notes

## Output and behaviour

- A rescue board of surplus food listings
- A list of sample community partners
- Matching only when a partner's area matches the listing area and the partner accepts that food type
- A pickup schedule for matched listings, with editable pickup times
- Status flow: Listed → Matched → Picked up → Delivered
- Filters by status and area
- Summary counts for active listings, matches, and delivered listings
- Listings are saved in the browser's local storage

## How to test

1. Add a listing: Fresh bread, 6 loaves, Riverside, with a future pickup window.
2. Match it with Riverside Community Pantry.
3. Change its pickup time in the pickup schedule.
4. Advance it through Picked up and then Delivered.
5. Add a listing in an unmatched area, such as Old Town, and check that no sample match is offered.
6. Try the status and area filters.
7. Reload the page and check that your listings are still there.

## Agent37 usage and boundaries

Agent37 was used as the managed build workspace. The app files were written under `/home/node/foodloop` on the Agent37 Personal Agent instance `cyco352lzc`. No external apps were connected, no paid plan was chosen, and no separate public demo was published. The GitHub repository is the submission deliverable.
