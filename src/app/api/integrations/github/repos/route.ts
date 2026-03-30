import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/auth";
import { logger } from "@/lib/logger";

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
}

export async function GET(request: Request) {
  const session = await getActiveSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "GitHub username is required" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "Academic-Curator-App"
      }
    });

    if (!response.ok) {
      if (response.status === 404) return NextResponse.json({ error: "User not found" }, { status: 404 });
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const repos = (await response.json()) as GitHubRepo[];
    
    // Transform data to fit portfolio project schema
    const projects = repos.map((repo) => ({
      id: repo.id.toString(),
      title: repo.name,
      description: repo.description || "",
      link: repo.html_url,
      tags: repo.language ? [repo.language] : [],
      stars: repo.stargazers_count,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    logger.error("GitHub Integration Error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Failed to fetch repositories" }, { status: 500 });
  }
}
