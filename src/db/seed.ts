import "dotenv/config";

import { database, pool } from "./index";
import { user, idea, tag, ideaTag, upvote } from "./schema";

// Seeded random number generator for consistent results
class SeededRandom {
  private seed: number;

  constructor(seed: number = 12345) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// Deterministic UUID generator
function generateDeterministicId(prefix: string, index: number): string {
  const paddedIndex = index.toString().padStart(8, "0");
  return `${prefix}-0000-4000-8000-${paddedIndex}`;
}

// Sample data for generating realistic content
const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Avery",
  "Quinn",
  "Sage",
  "River",
];

const lastNames = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
];

const ideaTitles = [
  "AI-powered personal assistant",
  "Sustainable urban transportation",
  "Virtual reality fitness platform",
  "Blockchain-based voting system",
  "Smart home automation hub",
  "Eco-friendly packaging solution",
  "Remote collaboration workspace",
  "Mental health tracking app",
  "Augmented reality shopping",
  "Automated meal planning service",
  "Social impact investment platform",
  "Renewable energy marketplace",
  "Digital art creation studio",
  "Language learning gamification",
  "Elderly care monitoring system",
  "Zero-waste lifestyle tracker",
  "Cryptocurrency education app",
  "Virtual event hosting platform",
  "Sustainable fashion marketplace",
  "AI-driven content creation",
  "Smart city traffic optimization",
  "Personalized nutrition advisor",
  "Remote team building games",
  "Carbon footprint calculator",
  "Mindfulness meditation guide",
];

const ideaDescriptions = [
  "An intelligent assistant that learns your preferences and helps optimize your daily routine.",
  "Revolutionary electric scooter sharing system with solar charging stations.",
  "Immersive VR workouts that make exercise engaging and fun for everyone.",
  "Secure, transparent voting system using blockchain technology for elections.",
  "Central hub that connects and controls all your smart home devices seamlessly.",
  "Biodegradable packaging made from agricultural waste materials.",
  "Virtual workspace with advanced collaboration tools for remote teams.",
  "Track mental health patterns and get personalized wellness recommendations.",
  "Try on clothes virtually before purchasing using AR technology.",
  "AI creates personalized meal plans based on dietary preferences and health goals.",
  "Platform connecting social entrepreneurs with impact-focused investors.",
  "Marketplace for buying and selling renewable energy between neighbors.",
  "Professional digital art tools with AI-assisted creation features.",
  "Learn languages through interactive games and real-world challenges.",
  "IoT sensors and AI to monitor elderly family members' wellbeing.",
  "Comprehensive app to help individuals achieve zero-waste living goals.",
  "Educational platform making cryptocurrency accessible to beginners.",
  "Host engaging virtual events with interactive features and networking.",
  "Marketplace for sustainable, ethically-made fashion brands.",
  "AI tools that help create high-quality content for businesses.",
  "Smart traffic management system reducing congestion in urban areas.",
  "Personalized nutrition advice based on genetic and lifestyle data.",
  "Fun virtual activities to strengthen remote team relationships.",
  "Calculate and track your environmental impact across all activities.",
  "Guided meditation sessions tailored to your stress levels and goals.",
];

const tagPool = [
  "ai",
  "machine-learning",
  "blockchain",
  "sustainability",
  "mobile",
  "web",
  "fintech",
  "healthcare",
  "education",
  "entertainment",
  "productivity",
  "social",
  "gaming",
  "iot",
  "ar",
  "vr",
  "saas",
  "marketplace",
  "platform",
  "automation",
  "analytics",
  "security",
  "privacy",
  "open-source",
  "cloud",
  "api",
  "microservices",
  "ui-ux",
  "accessibility",
  "performance",
  "scalability",
  "real-time",
  "collaboration",
  "remote-work",
  "wellness",
  "fitness",
  "nutrition",
  "mental-health",
  "environment",
  "climate",
  "renewable-energy",
  "smart-city",
  "transportation",
  "logistics",
  "e-commerce",
  "payments",
  "cryptocurrency",
  "defi",
  "nft",
  "metaverse",
  "robotics",
  "autonomous",
  "voice",
  "chatbot",
  "nlp",
  "computer-vision",
  "data-science",
  "big-data",
  "streaming",
  "backend",
  "frontend",
  "fullstack",
  "mobile-first",
  "progressive-web-app",
  "cross-platform",
  "native",
  "hybrid",
];

function getDeterministicElement<T>(array: T[], rng: SeededRandom): T {
  const index = rng.nextInt(0, array.length - 1);
  return array[index];
}

function getDeterministicElements<T>(
  array: T[],
  min: number,
  max: number,
  rng: SeededRandom
): T[] {
  const count = rng.nextInt(min, max);
  const indices = new Set<number>();

  // Generate unique indices
  while (indices.size < count && indices.size < array.length) {
    indices.add(rng.nextInt(0, array.length - 1));
  }

  return Array.from(indices).map((index) => array[index]);
}

async function main() {
  console.log("🌱 Starting database seeding...");

  const rng = new SeededRandom(12345); // Use consistent seed
  const now = new Date("2024-01-01T00:00:00Z"); // Use consistent base date

  // Create 10 users with deterministic data
  console.log("👥 Creating users...");
  const users = [];
  for (let i = 0; i < 10; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const userId = generateDeterministicId("user", i);

    // Create deterministic dates within last 30 days
    const daysBack = rng.nextInt(1, 30);
    const createdAt = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const newUser = {
      id: userId,
      name: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      emailVerified: true,
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}`,
      createdAt,
      updatedAt: now,
    };

    users.push(newUser);
  }

  await database.insert(user).values(users);
  console.log(`✅ Created ${users.length} users`);

  // Create tags with deterministic IDs
  console.log("🏷️ Creating tags...");
  const tags = tagPool.map((tagName, index) => ({
    id: generateDeterministicId("tag", index),
    name: tagName,
    createdAt: now,
    updatedAt: now,
  }));

  await database.insert(tag).values(tags);
  console.log(`✅ Created ${tags.length} tags`);

  // Create 25 ideas per user with deterministic data
  console.log("💡 Creating ideas...");
  const ideas = [];
  const ideaTagRelations = [];
  let ideaCounter = 0;
  let relationCounter = 0;

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const userData = users[userIndex];

    for (let i = 0; i < 25; i++) {
      const ideaId = generateDeterministicId("idea", ideaCounter);

      // Use deterministic selection based on counters
      const titleIndex = (userIndex * 25 + i) % ideaTitles.length;
      const descriptionIndex = (userIndex * 25 + i) % ideaDescriptions.length;
      const title = ideaTitles[titleIndex];
      const description = ideaDescriptions[descriptionIndex];

      // Create deterministic dates within last 20 days
      const daysBack = rng.nextInt(1, 20);
      const createdAt = new Date(
        now.getTime() - daysBack * 24 * 60 * 60 * 1000
      );

      const newIdea = {
        id: ideaId,
        userId: userData.id,
        title: `${title} ${ideaCounter + 1}`, // Add deterministic number to make unique
        description,
        createdAt,
        updatedAt: now,
      };

      ideas.push(newIdea);

      // Add deterministic tags to each idea (7-12 tags)
      const numTags = 7 + (ideaCounter % 6); // Cycles through 7-12
      const startTagIndex = (ideaCounter * 3) % tags.length; // Deterministic starting point

      for (let tagOffset = 0; tagOffset < numTags; tagOffset++) {
        const tagIndex = (startTagIndex + tagOffset) % tags.length;
        const selectedTag = tags[tagIndex];

        ideaTagRelations.push({
          id: generateDeterministicId("relation", relationCounter),
          ideaId: ideaId,
          tagId: selectedTag.id,
          createdAt: now,
          updatedAt: now,
        });
        relationCounter++;
      }

      ideaCounter++;
    }
  }

  await database.insert(idea).values(ideas);
  await database.insert(ideaTag).values(ideaTagRelations);
  console.log(
    `✅ Created ${ideas.length} ideas with ${ideaTagRelations.length} tag associations`
  );

  // Create deterministic upvotes
  console.log("👍 Creating upvotes...");
  const upvotes = [];
  const upvoteSet = new Set<string>(); // Track unique user-idea combinations
  let upvoteCounter = 0;

  for (let userIndex = 0; userIndex < users.length; userIndex++) {
    const userData = users[userIndex];

    // Each user will upvote a deterministic number of ideas (20-40)
    const numUpvotes = 20 + (userIndex % 21); // Cycles through 20-40
    const otherIdeas = ideas.filter((i) => i.userId !== userData.id);

    // Deterministic selection of ideas to upvote
    const startIdeaIndex = (userIndex * 17) % otherIdeas.length; // Deterministic starting point

    for (let i = 0; i < numUpvotes && i < otherIdeas.length; i++) {
      const ideaIndex = (startIdeaIndex + i) % otherIdeas.length;
      const selectedIdea = otherIdeas[ideaIndex];
      const upvoteKey = `${userData.id}-${selectedIdea.id}`;

      if (!upvoteSet.has(upvoteKey)) {
        upvoteSet.add(upvoteKey);

        // Create deterministic upvote date between idea creation and now
        const timeDiff = now.getTime() - selectedIdea.createdAt.getTime();
        const upvoteDelay = (upvoteCounter * 1000000) % timeDiff; // Deterministic delay
        const upvoteDate = new Date(
          selectedIdea.createdAt.getTime() + upvoteDelay
        );

        upvotes.push({
          id: generateDeterministicId("upvote", upvoteCounter),
          userId: userData.id,
          ideaId: selectedIdea.id,
          createdAt: upvoteDate,
          updatedAt: now,
        });
        upvoteCounter++;
      }
    }
  }

  await database.insert(upvote).values(upvotes);
  console.log(`✅ Created ${upvotes.length} upvotes`);

  // Summary
  console.log("\n🎉 Seeding completed successfully!");
  console.log(`📊 Summary:`);
  console.log(`   • ${users.length} users created`);
  console.log(
    `   • ${ideas.length} ideas created (${ideas.length / users.length} per user)`
  );
  console.log(`   • ${tags.length} unique tags created`);
  console.log(`   • ${ideaTagRelations.length} tag associations created`);
  console.log(`   • ${upvotes.length} upvotes created`);
  console.log(
    `   • Average ${(ideaTagRelations.length / ideas.length).toFixed(1)} tags per idea`
  );
  console.log(
    `   • Average ${(upvotes.length / users.length).toFixed(1)} upvotes per user`
  );

  await pool.end();
}

main().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
