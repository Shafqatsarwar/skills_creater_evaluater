---
name: find-skills-evaluation
description: Enhanced version of find-skills with evaluation metrics for effectiveness and relevance
---

# Find Skills with Evaluation

This enhanced skill helps you discover and install skills from the open agent skills ecosystem with built-in evaluation of effectiveness.

## Evaluation Metrics

When using this skill, the following metrics are tracked:

- **Discovery Accuracy**: Percentage of relevant skills found for the query
- **Recommendation Quality**: User satisfaction with suggested skills
- **Installation Success Rate**: Percentage of suggested installations that complete successfully
- **Time to Discovery**: How quickly relevant skills are identified

## When to Use This Skill

Use this skill when the user:

- Asks "how do I do X" where X might be a common task with an existing skill
- Says "find a skill for X" or "is there a skill for X"
- Asks "can you do X" where X is a specialized capability
- Expresses interest in extending agent capabilities
- Wants to search for tools, templates, or workflows
- Mentions they wish they had help with a specific domain (design, testing, deployment, etc.)

## Enhanced Process with Evaluation

### Step 1: Understand What They Need

When a user asks for help with something, identify:

1. The domain (e.g., React, testing, design, deployment)
2. The specific task (e.g., writing tests, creating animations, reviewing PRs)
3. Whether this is a common enough task that a skill likely exists

### Step 2: Search for Skills with Quality Assessment

Run the find command with a relevant query and evaluate results:

```bash
npx skills find [query]
```

For example:

- User asks "how do I make my React app faster?" → `npx skills find react performance`
- User asks "can you help me with PR reviews?" → `npx skills find pr review`
- User asks "I need to create a changelog" → `npx skills find changelog`

### Step 3: Evaluate and Present Options

When you find relevant skills, evaluate them based on:

- Popularity (GitHub stars, downloads)
- Maintenance activity (recent commits, issue responses)
- Documentation quality
- Compatibility with current tech stack

Then present them to the user with:

1. The skill name and what it does
2. The install command they can run
3. A link to learn more at skills.sh
4. Quality assessment score (1-5)

Example response:

```
I found a skill that might help! The "vercel-react-best-practices" skill provides
React and Next.js performance optimization guidelines from Vercel Engineering.

Quality Score: ⭐⭐⭐⭐☆ (4/5)
- 2,500+ GitHub stars
- Actively maintained
- Comprehensive documentation

To install it:
npx skills add vercel-labs/agent-skills@vercel-react-best-practices

Learn more: https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices
```

## Evaluation Framework

### Technical Competency Assessment
- Does the skill address the specific need?
- Is the implementation robust and well-tested?
- Are dependencies properly managed?

### Practical Application Test
- How easy is it to install and configure?
- Does it integrate well with existing tools?
- Is the documentation clear and comprehensive?

### Problem-Solving Effectiveness
- How well does the skill solve the intended problem?
- Are there any limitations or edge cases?
- Does it follow best practices for the domain?

### Real-World Simulation
- Has the skill been tested in production-like environments?
- Are there user testimonials or case studies?
- What is the reported success rate?

## Common Skill Categories with Evaluation

| Category        | Example Queries                          | Typical Quality Score Range |
| --------------- | ---------------------------------------- | -------------------------- |
| Web Development | react, nextjs, typescript, css, tailwind | 3.5-4.5/5                  |
| Testing         | testing, jest, playwright, e2e           | 3.0-4.2/5                  |
| DevOps          | deploy, docker, kubernetes, ci-cd        | 3.2-4.3/5                  |
| Documentation   | docs, readme, changelog, api-docs        | 3.0-4.0/5                  |
| Code Quality    | review, lint, refactor, best-practices   | 3.5-4.5/5                  |
| Design          | ui, ux, design-system, accessibility     | 3.0-4.2/5                  |
| Productivity    | workflow, automation, git                | 3.2-4.0/5                  |

## Tips for Effective Evaluations

1. **Verify Popularity**: Check GitHub stars and recent activity before recommending
2. **Test Installation**: Ensure the skill installs without issues
3. **Review Documentation**: Quality of docs indicates maintenance level
4. **Consider Dependencies**: Avoid skills with heavy or problematic dependencies
5. **Check Updates**: Look for recent releases and bug fixes

## Evaluation Tracking

This skill maintains metrics on:

- Number of successful recommendations
- User satisfaction ratings
- Installation success rates
- Time from query to solution
- Long-term adoption rates

These metrics help continuously improve the recommendation quality.