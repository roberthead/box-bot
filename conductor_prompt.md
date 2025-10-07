# Email Processing Guide

## Goal: AI Training & Resource Planning

The end goal is to train an AI chatbot to handle support automatically. We need to:
1. **Count & categorize ALL emails** (resolved + new) for resource planning
2. **Identify automation candidates** vs human-only issues
3. **Extract response patterns** for AI training data

## Quick Start: "Process" Command

When you say **"process"** to an AI agent, here's what happens:

### Step 1: Complete Email Analysis
- Count and categorize ALL emails (resolved + to-be-processed)
- Create volume metrics by issue type
- Identify trends and frequency patterns

### Step 2: Automation Assessment
- **Bot-Ready:** Issues with clear, repeatable solutions
- **Human-Required:** Complex, unique, or sensitive issues
- **Hybrid:** Bot can gather info, human provides solution

### Step 3: AI Training Data Extraction
- Extract your successful response patterns
- Document decision trees for common issues
- Create training examples for chatbot

## Manual Processing Steps

### For Individual Emails:
1. **Read & Categorize**
   - Email mismatch (most common)
   - Technical issue (cache, login, OAuth)
   - Feature request (downloads, TV apps)
   - Account management (sign-up confusion)

2. **Check if FAQ Needs Update**
   - Is this a new type of issue?
   - Is this becoming more frequent?
   - Would a FAQ entry prevent future emails?

3. **Update Feature Roadmap**
   - New feature requests get added
   - Existing requests get validation (+1 customer)
   - Priority levels based on frequency

4. **Move to Resolved**
   - Once processed, move to `support-emails/resolved/`

### For Batch Processing:
1. **Count by Category**
   ```
   Email Mismatch: X emails
   Technical Issues: X emails
   Feature Requests: X emails
   Account Issues: X emails
   ```

2. **Update FAQ** - Add new sections for patterns of 2+ emails
3. **Update Roadmap** - Add new features, update existing ones
4. **Move All Files** - Batch move to resolved folder
5. **Update Counters** - Update "based on X emails" in both files

## Current Email Categories (Based on 35+ emails)

### Most Common Issues:
1. **Email Mismatch** - Kickstarter email vs current email
2. **Cache/Loading Issues** - Browser problems accessing library
3. **Sign-up Confusion** - Login vs create account
4. **Download Requests** - Want offline access
5. **TV/Streaming** - Roku, Apple TV, screencast issues

### Feature Requests:
1. **Download Options** - Most requested
2. **TV Apps** - Roku, Apple TV
3. **Gift Purchases** - For friends/family
4. **Screening Rights** - Educational/community use
5. **Subtitle Files** - SRT downloads

## File Naming Convention
`YYYYMMDD-firstname-lastname-issue-type.md`

Examples:
- `20250828-sarah-code-not-working.md`
- `20250925-james-download.md`
- `20250902-roland-login-confusion.md`

## Processing Checklist

- [ ] Read all emails in to-be-processed-by-ai folder
- [ ] Categorize by issue type
- [ ] Identify new patterns (2+ similar emails)
- [ ] Update FAQ with new sections
- [ ] Update feature roadmap with new requests
- [ ] Move emails to resolved folder
- [ ] Update email counters in FAQ/roadmap
- [ ] Note any urgent technical issues for immediate attention

## AI Processing Prompt

```
Process all emails in support-emails/to-be-processed-by-ai/ folder:

1. Categorize each email by issue type
2. Identify patterns and new issues
3. Update FAQ.md with new sections for recurring issues
4. Update feature-roadmap.md with new requests and validation
5. Move processed emails to resolved folder
6. Update email counters
7. Provide summary of what was processed

Use voice-and-style-guide.md for language consistency.
```


## Additional Guidelines

If you lack the tools or capability to accomplish anything you have been asked to do, just output something like "[Use Tool X]" so that we know you would have done that.

---

*This guide documents the manual process until N8N automation is implemented.*
