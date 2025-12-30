# Architecture

This section explains how the system works and the design decisions behind it.

## Purpose

When you need to understand the technical design, routing decisions, or system architecture, this is where to look. These documents provide:

- Mental models of how components interact
- System design decisions and their rationale
- Route configuration and safety analysis
- Generated route listings for reference

## Documents

- **[AI_SECURITY_PRINCIPLES.md](./AI_SECURITY_PRINCIPLES.md)** - ⭐ **Core security-first principles for AI-assisted features** (read this first)
- **[ROUTE_APPROACHES_ANALYSIS.md](./ROUTE_APPROACHES_ANALYSIS.md)** - Comparison of routing approaches and justification for current App Router approach
- **[ROUTE_SAFETY_ANALYSIS.md](./ROUTE_SAFETY_ANALYSIS.md)** - Analysis of route configuration safety, dynamic imports, and potential issues
- **[app-routes.md](./app-routes.md)** - Generated listing of App Router routes (for reference)
- **[local-routes.md](./local-routes.md)** - Generated listing of local build routes (for reference)

## When to Read

- **Working with AI features**: Read AI_SECURITY_PRINCIPLES.md first (required)
- **Understanding routing**: Read ROUTE_APPROACHES_ANALYSIS.md and ROUTE_SAFETY_ANALYSIS.md
- **Debugging route issues**: Check app-routes.md or local-routes.md for generated route listings
- **Making architectural changes**: Review these documents before modifying routing structure

## Reading Order

1. **AI_SECURITY_PRINCIPLES.md** - Core principles for AI-assisted features (required)
2. ROUTE_SAFETY_ANALYSIS.md for current state
3. ROUTE_APPROACHES_ANALYSIS.md for context on decisions
4. Route listings (app-routes.md, local-routes.md) as reference

