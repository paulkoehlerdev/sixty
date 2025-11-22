![Sixty Banner](docs/banner.png)

# Sixty

A seamless post-booking solution for SIXT, delivering the same exceptional quality as in-store. Enjoy a fast, intuitive experience with personalized recommendations for your journey.

## Inspiration

We wanted to create a truly personalized experience for every customer — something that feels like speaking to a real person at the SIXT counter. In a physical rental location, the staff can upsell, guide customers, and help them get the best experience possible. With digital rental car processes, this personal interaction is mostly lost.

Our goal is simple:

> **Bring back the human, personal experience to the digital pickup process — and improve the UX of getting your rental car from SIXT.**

## What It Does

Our project enhances the moment right before a customer picks up their rental car. Shortly before arrival, the customer receives a personalized notification that feels like proactive support reaching out to help.

Through an interactive chat, users can improve and customize their SIXT experience directly before getting the car — almost like having a personal assistant.

It is built as an app/web service.

The system uses the production **SIXT API** to fetch real offers and addon options. All this information, paired with the customer’s booking details, is fed into an **AI Agent** that assists the user in making informed decisions.

This is a modern take on a well-known problem, powered by natural language interaction as the new “device.”

## How to Use It

* You can run it locally using your own **OpenAI API key**,
  **or**
* Try it directly at:
  **[http://sixty.twentyfivesoftware.workers.dev/](http://sixty.twentyfivesoftware.workers.dev/)**

You’ll need to bring your own **OpenAI API key** regardless of setup.

The experience works on desktop, but it is intended for **mobile** use.


## The Team

This project was built during **hackaTUM 2025** by:

* **Simon Weckler**
* **Matthias Kirstein**
* **Paul Köhler**


## How We Built It

We used the combined power of **Vercel** and **Cloudflare** for hosting and AI communication.


## Challenges We Ran Into

The biggest technical challenge was getting the integration between the custom UI and the AI Agent just right. Achieving a smooth, unified experience required a surprising amount of iteration.


## Accomplishments We’re Proud Of

We’re proud that the project already delivers real, meaningful results and feels great to use — even though it still needs optimization for speed and stability.
The first time we went through the full interaction flow with the Agent was a truly rewarding moment.


## What We Learned

We learned a lot about integrating AI Agents into custom UI experiences and how to make both parts feel unified and natural.


## What’s Next

In the future, the entire booking process itself could take place in the chat as well — something that feels increasingly within reach.

Beyond that… we’ll see where it goes.