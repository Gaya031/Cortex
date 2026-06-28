<div align="center">

# 🚀 AI Project Intelligence Editor

### *An AI-powered Code Editor that understands your entire software project.*

Instead of understanding only the currently opened file, AI Project Intelligence Editor builds a complete knowledge graph of your repository, allowing developers to visualize architecture, understand execution flow, safely refactor code, analyze impact, and interact with their entire codebase using natural language.

---

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![NodeJS](https://img.shields.io/badge/Node.js-22-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![LangChain](https://img.shields.io/badge/LangChain-AI-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)

</div>

---

# 📖 Table of Contents

- Project Overview
- Motivation
- Problem Statement
- Existing Problems
- Solution
- Vision
- Objectives
- Key Features
- System Architecture
- Installation
- Documentation

---

# 🌍 Project Overview

Software projects are becoming increasingly complex.

A modern production application is no longer made up of just a few files. Instead, it contains hundreds or even thousands of interconnected files, components, services, APIs, utilities, hooks, middleware, databases, caches, and third-party integrations.

Understanding such a project has become one of the biggest challenges for developers.

Traditional IDEs and AI coding assistants help developers write code faster, but they still suffer from one major limitation:

> **They only understand the currently opened file.**

They cannot reason about the project as a whole.

Developers still spend a significant amount of time navigating through folders, tracing function calls, searching for dependencies, understanding execution flow, and estimating the impact of changes before making even a small modification.

AI Project Intelligence Editor was built to solve this exact problem.

Instead of acting as another autocomplete assistant, it acts as an **AI-powered software architect** that understands the entire repository.

---

# 🎯 Motivation

While working on large MERN and FastAPI projects, I repeatedly encountered the same problems.

Whenever I wanted to modify a function, I had to answer several questions before writing a single line of code.

- Which files import this module?
- Which functions call this function?
- What will break if I rename this component?
- Where does the execution start?
- Which APIs are responsible for this screen?
- Which services interact with Redis?
- Which database collections are affected?
- How are all these modules connected?

Finding these answers manually required opening dozens of files.

Even GitHub Copilot and ChatGPT required me to manually provide context because they could not understand the entire project automatically.

That became the inspiration behind this project.

Instead of giving AI a single file,

**Why not let AI understand the complete repository?**

---

# ❌ Problem Statement

Modern AI coding assistants operate with a very limited context window.

Although Large Language Models have become increasingly capable, the tools surrounding them still struggle to understand software architecture.

For example,

Suppose a developer wants to modify the following function:

```ts
createUser()
```

Before making changes, they need to know:

- Which APIs call this function?
- Which services depend on it?
- Which components trigger it?
- Which database models are affected?
- Which other modules import it?
- What is the overall impact of changing this function?

Today's IDEs require developers to manually search for this information.

As projects grow larger, this process becomes increasingly time-consuming.

---

# ⚠ Problems with Existing Solutions

Current developer tools focus primarily on writing code rather than understanding code.

## Traditional IDEs

Traditional IDEs provide features like:

- Go to Definition
- Find References
- Search Files
- Rename Symbol

Although useful, these tools only answer one question at a time.

They cannot explain architecture or project behavior.

---

## AI Coding Assistants

Modern AI assistants such as GitHub Copilot and Cursor primarily work using the currently opened files.

Their understanding is limited by:

- Context window
- Open tabs
- Manually selected files

As a result,

They cannot accurately answer questions such as

- Explain the authentication architecture.
- Show me the entire payment flow.
- Which services depend on Redis?
- What happens after clicking Login?
- Which functions will be affected by changing JWT verification?

---

## Large Enterprise Projects

Enterprise repositories often contain

- 500+
- 5,000+
- sometimes even 50,000+

source files.

Understanding such projects manually is extremely difficult for new developers.

Onboarding can take weeks.

---

# 💡 Solution

AI Project Intelligence Editor approaches software development differently.

Instead of treating source code as plain text,

it converts the repository into structured knowledge.

The repository is analyzed through multiple stages.

```
Repository

↓

Parser

↓

AST

↓

Metadata Extraction

↓

Knowledge Graph

↓

AI Layer

↓

Developer
```

Once this structured knowledge has been generated, developers can perform intelligent operations across the entire project.

Examples include

- Architecture visualization
- Dependency analysis
- Call graph generation
- Project execution flow
- AI repository chat
- Explain code
- Repository-wide rename refactoring
- Impact analysis
- Architecture summary generation

Rather than searching through files manually, developers simply interact with the repository itself.

---

# 🌟 Vision

The long-term vision of this project is to build an AI-native software engineering platform.

Instead of becoming another code editor,

the goal is to become an intelligent engineering workspace capable of understanding every layer of a software system.

Eventually, the platform should be able to answer questions such as

- Explain the authentication architecture.
- Show complete payment execution.
- Why was this module created?
- Which services communicate with Redis?
- Generate system design documentation.
- Review pull requests.
- Predict architectural bottlenecks.
- Detect code smells automatically.
- Suggest scalable refactoring.

The editor should become an engineering teammate rather than simply an autocomplete engine.

---

# 🎯 Project Objectives

The primary objectives of AI Project Intelligence Editor are

## Repository Understanding

Understand the complete repository instead of isolated files.

---

## Architecture Visualization

Generate visual graphs representing

- Dependencies
- Function Calls
- Project Execution Flow

---

## Safe Refactoring

Allow developers to rename symbols confidently by understanding repository-wide relationships.

---

## AI-assisted Development

Enable developers to communicate with the repository using natural language.

---

## Faster Onboarding

Help new developers understand unfamiliar projects within minutes instead of days.

---

## Better Software Maintenance

Provide architecture insights before making code changes.

---

## Intelligent Navigation

Replace manual searching with semantic understanding.

---

# ✨ Key Features

## Repository Indexing

Parses the entire repository and extracts

- Files
- Components
- Functions
- Classes
- Imports
- Exports
- Calls
- Relationships

---

## Knowledge Graph

Builds a graph database representing the relationships between every software entity.

---

## Dependency Graph

Visualizes

- File imports
- Module dependencies
- Circular dependencies
- Architecture structure

---

## Call Graph

Displays

- Function calls
- Component interactions
- Hook relationships
- API execution

---

## Project Flow Graph

Shows the overall execution path of the application from user interaction to backend processing.

---

## Architecture Summary

Automatically identifies

- Critical files
- Orphan files
- Highly coupled modules
- Circular dependencies

---

## Impact Analysis

Predicts which functions will be affected before modifying code.

---

## Explain Code

Uses AI to explain

- Functions
- Components
- Classes
- Files
- Architecture

---

## Repository Chat

Ask questions such as

- Explain authentication.
- Show payment flow.
- Where is JWT verified?
- Which services use Redis?

---

## Monaco Editor

Integrated browser-based code editor with repository intelligence.

---

## Rename Refactor

Safely rename repository-wide symbols using graph relationships instead of simple text replacement.

---

## Redis Caching

Caches

- Graphs
- AI responses
- Repository metadata
- Architecture summaries

to improve overall performance.

---

# 🚧 Current Status

The project currently includes:

- ✅ Repository Indexing
- ✅ Knowledge Graph
- ✅ Dependency Graph
- ✅ Call Graph
- ✅ Project Flow Graph
- ✅ Architecture Summary
- ✅ Node Details
- ✅ Impact Analysis
- ✅ Explain Code
- ✅ Repository Chat
- ✅ Monaco Editor
- ✅ Rename Refactor
- ✅ Redis Integration
- ✅ GitHub Repository Integration
- ✅ Deployment

This project continues to evolve toward becoming a complete AI-native software engineering platform.

# 🏗 System Architecture

AI Project Intelligence Editor is designed around a simple philosophy:

> **Before an AI model can reason about a software project, the software itself must first be converted into structured knowledge.**

Instead of directly sending source files to an LLM, the repository passes through multiple processing stages where code is analyzed, transformed into metadata, connected through relationships, and finally stored as a knowledge graph.

The AI layer operates on this structured representation rather than raw source code.

The complete pipeline looks like this:

```
                GitHub Repository
                       │
                       ▼
              Repository Cloning
                       │
                       ▼
               File Discovery
                       │
                       ▼
                 AST Parsing
                       │
                       ▼
              Metadata Extraction
                       │
                       ▼
               Semantic Chunking
                       │
                       ▼
              Knowledge Graph
                       │
        ┌──────────────┼───────────────┐
        ▼              ▼               ▼
 Dependency Graph   Call Graph   Project Flow
        │              │               │
        └──────────────┼───────────────┘
                       ▼
               Architecture Engine
                       │
                       ▼
                 AI Intelligence
                       │
       ┌───────────────┼─────────────────┐
       ▼               ▼                 ▼
 Explain Code     Repository Chat   Rename Refactor
                       │
                       ▼
                 Monaco Editor
```

---

# 🧠 High-Level Architecture

The project is divided into six independent layers.

```
Frontend

↓

API Layer

↓

Repository Intelligence Engine

↓

Knowledge Graph Engine

↓

AI Engine

↓

Database + Cache
```

Each layer has a single responsibility.

---

# 1️⃣ Frontend Layer

The frontend is responsible for visualization and developer interaction.

It never performs any heavy analysis.

Responsibilities include:

- Repository Explorer
- Monaco Code Editor
- Architecture Graphs
- AI Chat
- Explain Code
- Impact Analysis
- Rename Refactor
- Project Navigation

Technologies

- Next.js
- React
- TypeScript
- Tailwind CSS
- Zustand
- React Flow
- Monaco Editor

---

# 2️⃣ API Layer

The backend exposes REST APIs that connect the frontend with the intelligence engine.

Example APIs

```
POST /index

GET /graph/visual

GET /callgraph

GET /architecture/summary

POST /impact

POST /rename

POST /explain

POST /chat
```

The API layer is intentionally lightweight.

Its responsibility is simply

```
Receive Request

↓

Validate

↓

Call Service

↓

Return Response
```

All business logic lives inside the service layer.

---

# 3️⃣ Repository Intelligence Engine

This is the core of the project.

Instead of treating code as plain text, the Repository Intelligence Engine understands software structure.

Its responsibilities include

- Repository indexing
- AST parsing
- Metadata extraction
- Chunk generation
- Symbol detection
- Relationship detection

The output of this stage is structured metadata.

Example

```
File

↓

Functions

↓

Components

↓

Imports

↓

Exports

↓

Calls

↓

Classes
```

No AI is involved during this stage.

Everything is static analysis.

---

# 4️⃣ AST Parsing

Every supported source file is converted into an Abstract Syntax Tree.

```
Source Code

↓

Parser

↓

AST
```

Instead of reading code line by line,

the parser understands

- Variables

- Functions

- Components

- Classes

- Imports

- Exports

- JSX

- Hooks

- Method Calls

Example

```
function login(){

}
```

becomes

```
FunctionDeclaration

↓

Identifier

↓

Parameters

↓

Body
```

This allows the editor to understand code structurally instead of textually.

---

# 5️⃣ Metadata Extraction

Once the AST has been created,

the parser walks through every node and extracts useful information.

Example metadata

```
File Path

Function Name

Component Name

Imports

Exports

Calls

Parameters

Return Type

Node Type
```

This metadata becomes the foundation of every future feature.

Nothing is generated by AI.

Everything comes directly from the source code.

---

# 6️⃣ Semantic Chunking

Large files are divided into logical chunks.

Instead of sending an entire 2000-line file to the AI,

the project creates meaningful chunks.

Examples

```
One Function

↓

One Component

↓

One Class

↓

One Hook
```

Each chunk stores

```
Content

Metadata

Relationships

File Path

Node Type
```

This dramatically improves retrieval quality.

---

# 7️⃣ Knowledge Graph

After metadata extraction,

all software entities become graph nodes.

Examples

```
File

Function

Component

Class
```

Relationships become graph edges.

Examples

```
IMPORTS

CALLS

CONTAINS

EXPORTS
```

Example

```
Dashboard.tsx

↓

contains

↓

Dashboard Component

↓

calls

↓

useUsers()

↓

calls

↓

getUsers()

↓

calls

↓

Database
```

The Knowledge Graph becomes the central source of truth.

Every feature uses this graph.

---

# 8️⃣ Graph Engine

Instead of building one graph,

the system generates multiple specialized graphs.

Each graph answers a different engineering question.

```
Knowledge Graph

│

├── Dependency Graph

├── Call Graph

└── Project Flow Graph
```

Each graph uses the same repository metadata.

Only the filtering logic changes.

---

# Dependency Graph

Purpose

Understand project architecture.

Questions answered

- Which files import this file?

- Which modules depend on this service?

- Is there a circular dependency?

- Which files are tightly coupled?

Relationships used

```
IMPORTS

CONTAINS
```

---

# Call Graph

Purpose

Understand runtime interactions.

Questions answered

- Which function calls this function?

- Which component invokes this hook?

- What breaks if I modify this API?

Relationships used

```
CALLS
```

---

# Project Flow Graph

Purpose

Explain the complete application execution.

Instead of showing individual function calls,

this graph explains the entire feature flow.

Example

```
Browser

↓

Login

↓

Dashboard

↓

Button

↓

API

↓

Controller

↓

Service

↓

Redis

↓

Database

↓

Response

↓

UI Update
```

Unlike the Call Graph,

this graph focuses on user journeys.

---

# 9️⃣ AI Intelligence Layer

Once repository knowledge has been generated,

the AI layer becomes useful.

Instead of receiving raw files,

the AI receives

```
Relevant Chunks

+

Graph Relationships

+

Architecture Metadata

+

Developer Prompt
```

This significantly improves answer quality.

The AI always has repository context.

---

# 🔟 Explain Code

Pipeline

```
Selected Node

↓

Retrieve Chunk

↓

Collect Relationships

↓

Build Context

↓

LLM

↓

Explanation
```

Instead of explaining only one function,

the AI also explains

- Why it exists

- Who calls it

- What it depends on

- Architectural role

---

# 1️⃣1️⃣ Repository Chat

Pipeline

```
User Question

↓

Embedding Search

↓

Relevant Chunks

↓

Knowledge Graph

↓

LLM

↓

Answer
```

Unlike traditional RAG,

the graph provides additional repository relationships.

---

# 1️⃣2️⃣ Rename Refactor

Pipeline

```
Rename Request

↓

Knowledge Graph

↓

Affected Nodes

↓

File Updates

↓

Safe Rename
```

This avoids simple text replacement.

Only valid symbols are renamed.

---

# 1️⃣3️⃣ Impact Analysis

Before modifying a function,

the system traverses the call graph.

```
Selected Function

↓

Reverse Graph Traversal

↓

Affected Functions

↓

Impact Score

↓

Developer
```

This helps developers estimate the cost of changes before writing code.

---

# 1️⃣4️⃣ Redis Caching

Repository analysis is expensive.

Instead of recomputing graphs repeatedly,

Redis stores

- Repository graphs
- Architecture summary
- AI responses
- Explain Code results
- Repository metadata

Benefits

- Faster graph loading
- Reduced LLM cost
- Better scalability
- Lower latency

---

# 1️⃣5️⃣ Database Layer

MongoDB stores

```
Workspaces

Files

Chunks

Knowledge Graph Nodes

Knowledge Graph Edges

Embeddings

AI Metadata
```

MongoDB acts as the permanent knowledge store,

while Redis acts as the temporary high-speed cache.

---

# 🔚 End-to-End Request Flow

```
GitHub Repository

↓

Repository Indexer

↓

AST Parser

↓

Metadata Extraction

↓

Semantic Chunking

↓

Knowledge Graph

↓

Graph Engine

↓

Redis Cache

↓

AI Engine

↓

Frontend

↓

Developer
```

At every stage, the repository becomes more intelligent.

By the time the AI model is invoked, it no longer sees raw source code.

Instead, it receives a structured understanding of the software system, enabling significantly more accurate reasoning than traditional code assistants.

# ⚙ Repository Intelligence Engine

The Repository Intelligence Engine is the heart of AI Project Intelligence Editor.

Instead of relying solely on Large Language Models to understand a software project, the system first performs static analysis on the entire repository.

The goal is simple:

> **Convert unstructured source code into structured software knowledge.**

Only after this transformation does the AI interact with the project.

This architecture makes the system significantly faster, more scalable, and much more accurate than simply sending source files directly to an LLM.

---

# Why Not Send the Entire Repository to an LLM?

A common question is:

> Why not simply upload the repository to ChatGPT?

Although this sounds simple, it has several practical limitations.

## Context Window Limit

Large repositories often contain

- 500 files
- 2,000 functions
- 100,000+ lines of code

No current LLM can efficiently process an entire production repository in every request.

---

## Token Cost

Sending thousands of lines repeatedly would dramatically increase

- latency
- API cost
- response time

---

## No Repository Memory

Even if the repository is uploaded once,

the model still does not understand

- dependencies
- architecture
- execution flow
- coupling
- runtime relationships

It simply sees text.

---

## Static Analysis is Faster

Many software questions do not require AI.

Examples include

- Which file imports this file?
- Which functions call this function?
- Which components use this hook?
- Which service updates this database?

These can all be answered through static analysis.

The Repository Intelligence Engine performs these operations instantly without invoking an LLM.

---

# Repository Processing Pipeline

Whenever a repository is indexed, it passes through multiple processing stages.

```
Repository

↓

File Scanner

↓

Language Detection

↓

Parser

↓

AST

↓

Metadata Extraction

↓

Chunk Generator

↓

Knowledge Graph Builder

↓

Embeddings

↓

Database

↓

Redis Cache
```

Every stage enriches the repository with more semantic information.

---

# Stage 1 — Repository Discovery

The indexing process begins by scanning the repository.

Responsibilities include

- locating supported source files
- ignoring build artifacts
- ignoring dependencies
- identifying project structure

Ignored directories include

```
node_modules

.git

.next

dist

build

coverage

out
```

Supported file types include

```
.ts

.tsx

.js

.jsx

.py

java

go

cpp

c

```

Each discovered file is registered inside the workspace.

---

# Stage 2 — Language Detection

Before parsing,

the engine identifies the language of every file.

Example

```
User.tsx

↓

TypeScript React

↓

Use TypeScript Parser
```

Another example

```
server.py

↓

Python

↓

Use Python Parser
```

This makes the indexing engine language-independent.

New parsers can be added without modifying the overall pipeline.

---

# Stage 3 — AST Generation

Every source file is converted into an Abstract Syntax Tree (AST).

Instead of treating code as plain text,

the parser understands the programming language grammar.

Example

```ts
function login(user) {
    authenticate(user)
}
```

becomes

```
Program

↓

FunctionDeclaration

↓

Identifier

↓

Parameters

↓

BlockStatement

↓

CallExpression
```

This structured representation enables the system to reason about software.

---

# Stage 4 — Metadata Extraction

After AST generation,

the parser walks through every AST node.

During traversal, it extracts software entities.

Examples include

```
Files

Functions

Components

Classes

Interfaces

Enums

Hooks

Variables

Imports

Exports

Method Calls
```

Every extracted entity becomes a future graph node.

---

# Stage 5 — Relationship Detection

Extracting entities alone is not enough.

The system also detects relationships.

Examples

```
File

↓

contains

↓

Function
```

```
Component

↓

calls

↓

Hook
```

```
Hook

↓

calls

↓

API Service
```

```
Service

↓

imports

↓

Redis Client
```

These relationships later become graph edges.

---

# Stage 6 — Semantic Chunk Generation

Large source files are divided into logical chunks.

Instead of storing entire files,

the system stores meaningful units.

Examples

```
One Function

One Component

One Class

One Hook

One Utility
```

Each chunk contains

```
Content

Metadata

Relationships

File Path

Node Type

Language

Start Line

End Line
```

This dramatically improves AI retrieval.

---

# Stage 7 — Knowledge Graph Generation

Every extracted entity becomes a graph node.

Example

```
Dashboard.tsx

↓

Dashboard Component

↓

useUsers()

↓

getUsers()

↓

UserService
```

Edges describe software relationships.

Examples

```
IMPORTS

CALLS

CONTAINS

USES

EXPORTS
```

The graph represents the entire repository structure.

---

# Stage 8 — Graph Persistence

Instead of rebuilding graphs repeatedly,

all graph data is stored.

Stored collections include

```
Files

Chunks

Graph Nodes

Graph Edges

Embeddings
```

This allows future operations to execute in milliseconds.

---

# Stage 9 — Embedding Generation

Every semantic chunk is converted into a vector embedding.

Pipeline

```
Chunk

↓

Embedding Model

↓

Vector

↓

Database
```

These embeddings enable semantic repository search.

Example

Developer asks

```
How does authentication work?
```

The system retrieves

- Login Service
- JWT Middleware
- User Controller
- Authentication Routes

before invoking the AI.

---

# Stage 10 — Redis Cache

Many operations are expensive.

Examples

- Architecture Summary
- Graph Layout
- Explain Code
- Repository Chat
- Impact Analysis

Instead of recomputing,

the results are cached.

```
Request

↓

Redis

↓

Cache Hit?

↓

Yes

↓

Return Immediately

↓

No

↓

Compute

↓

Store

↓

Return
```

This significantly reduces latency.

---

# Internal Backend Modules

The backend is intentionally modular.

Each service performs a single responsibility.

```
Indexer

↓

Parser

↓

Chunker

↓

Embedding Service

↓

Graph Builder

↓

Architecture Service

↓

Call Graph Service

↓

Impact Analysis

↓

Explain Service

↓

Repository Chat

↓

Rename Refactor
```

Because each module is isolated,

new features can be added without affecting existing services.

---

# Why This Architecture?

Most AI coding assistants depend almost entirely on LLM reasoning.

This project shifts much of that reasoning into deterministic static analysis.

Benefits include

- Faster responses
- Lower AI costs
- Better scalability
- Accurate repository understanding
- Reduced hallucinations
- Deterministic graph generation

The AI is only used where natural language understanding is required.

Everything else is powered by the Repository Intelligence Engine.

---

# End-to-End Indexing Example

Suppose a repository contains the following code.

```
Dashboard.tsx

↓

useUsers()

↓

getUsers()

↓

api.ts

↓

Express Route

↓

Controller

↓

Service

↓

Redis

↓

MongoDB
```

During indexing,

the engine performs the following operations.

```
Scan Files

↓

Parse AST

↓

Extract Components

↓

Extract Hooks

↓

Extract Functions

↓

Extract Imports

↓

Extract Calls

↓

Create Graph Nodes

↓

Create Graph Edges

↓

Generate Chunks

↓

Generate Embeddings

↓

Store Metadata

↓

Cache Results
```

After indexing completes,

the repository is no longer treated as plain source code.

Instead,

it becomes a structured software knowledge base capable of supporting architecture visualization, intelligent navigation, AI reasoning, repository-wide refactoring, and impact analysis.

# 🧠 Knowledge Graph Architecture

The Knowledge Graph is the central intelligence layer of AI Project Intelligence Editor.

Rather than treating source code as plain text, the system models the entire repository as a graph of interconnected software entities.

Instead of asking

> "What does this file contain?"

the system asks

> "How is every software entity related to every other entity?"

This graph becomes the foundation for every intelligent capability in the editor.

Every architecture visualization, AI response, impact analysis, repository search, and refactoring operation is built on top of this graph.

---

# Why Build a Knowledge Graph?

Modern software systems are highly interconnected.

A single feature may involve

- React Components
- Custom Hooks
- API Routes
- Controllers
- Services
- Redis
- Database Models
- Utility Functions

These entities rarely exist in isolation.

Instead, they form a network of relationships.

Example

```
Dashboard

↓

UserList

↓

useUsers

↓

getUsers

↓

UserService

↓

Redis

↓

MongoDB
```

Representing these relationships as plain JSON quickly becomes difficult.

Graphs naturally represent connected systems.

---

# Why Not Store Everything as Documents?

A document database stores information independently.

Example

```
File

{
    imports: [],
    exports: [],
    functions: []
}
```

While this is useful for storage,

it becomes inefficient for questions like

- Which files depend on this module?
- Which functions call this function?
- What is the shortest execution path?
- What breaks if this changes?
- Which modules form cycles?

These are graph traversal problems.

A Knowledge Graph solves them naturally.

---

# Graph Fundamentals

Every graph consists of two things.

## Nodes

Nodes represent software entities.

## Edges

Edges represent relationships between entities.

```
Node

↓

Edge

↓

Node
```

Everything inside the repository can eventually be represented this way.

---

# Graph Nodes

Every meaningful software entity becomes a node.

Current node types include

```
FILE

FUNCTION

COMPONENT

CLASS

EXTERNAL_MODULE
```

Future versions may also include

```
API Route

Middleware

Database Model

Redis Cache

Queue

Cron Job

Event

Microservice

Docker Container
```

---

# FILE Nodes

A file node represents a source file inside the repository.

Example

```
src/services/user.service.ts
```

Stored metadata

```
Node ID

Workspace ID

File Path

Language

Extension

Imports

Exports
```

Purpose

Provide the structural backbone of the repository.

---

# FUNCTION Nodes

Every function becomes an independent graph node.

Example

```ts
function createUser()
```

becomes

```
FUNCTION

↓

createUser()
```

Metadata

```
Function Name

Parameters

Return Type

File Path

Location

Relationships
```

---

# COMPONENT Nodes

React components are treated separately.

Example

```
Dashboard

↓

UserList

↓

OrderList
```

Why?

Components have different relationships compared to functions.

They

- render other components
- call hooks
- invoke services
- manage state

---

# CLASS Nodes

Class declarations become nodes.

Example

```
UserService

↓

AuthenticationService

↓

RedisCache
```

This enables

- inheritance visualization
- dependency analysis
- service architecture

---

# EXTERNAL MODULE Nodes

Third-party libraries also become graph nodes.

Examples

```
Express

React

MongoDB

Redis

Axios

JWT

LangChain
```

These nodes allow developers to understand external dependencies.

---

# Graph Edges

Edges represent relationships.

Current edge types include

```
CONTAINS

CALLS

FILE_IMPORTS_FILE
```

Additional edge types can easily be introduced.

---

# CONTAINS Relationship

Represents ownership.

Example

```
Dashboard.tsx

↓

CONTAINS

↓

Dashboard Component
```

Another example

```
user.service.ts

↓

CONTAINS

↓

createUser()
```

This creates the file hierarchy.

---

# FILE_IMPORTS_FILE Relationship

Represents imports.

Example

```
Dashboard.tsx

↓

imports

↓

UserList.tsx
```

These edges build the Dependency Graph.

---

# CALLS Relationship

Represents runtime execution.

Example

```
Dashboard()

↓

calls

↓

useUsers()

↓

calls

↓

getUsers()

↓

calls

↓

apiClient()
```

These edges build the Call Graph.

---

# Example Knowledge Graph

Consider this project.

```
Dashboard.tsx

↓

useUsers()

↓

getUsers()

↓

UserService

↓

Redis

↓

MongoDB
```

Internally,

the graph looks like

```
FILE

↓

CONTAINS

↓

Dashboard Component

↓

CALLS

↓

useUsers

↓

CALLS

↓

getUsers

↓

CALLS

↓

Redis

↓

CALLS

↓

MongoDB
```

Every relationship is explicitly stored.

---

# Graph Construction Pipeline

The Knowledge Graph is built during repository indexing.

Pipeline

```
Repository

↓

Parser

↓

AST

↓

Metadata Extraction

↓

Node Generation

↓

Relationship Detection

↓

Edge Generation

↓

MongoDB

↓

Redis Cache
```

No AI is involved during graph construction.

Everything is deterministic.

---

# Node Generation

Whenever the parser discovers

```
Function

Component

Class

File
```

it creates a graph node.

Example

```ts
function login()
```

becomes

```
Node

ID

Type

FUNCTION

Name

login
```

---

# Edge Generation

Whenever the parser discovers relationships,

edges are generated.

Example

```ts
import Dashboard from "./Dashboard"
```

creates

```
App.tsx

↓

FILE_IMPORTS_FILE

↓

Dashboard.tsx
```

Another example

```ts
useUsers()
```

creates

```
Dashboard

↓

CALLS

↓

useUsers
```

---

# Graph Storage

Nodes and edges are stored independently.

```
Graph Nodes Collection

↓

Graph Edges Collection
```

This separation makes graph traversal significantly faster.

---

# Graph Traversal

Once stored,

the graph can answer complex software engineering questions.

Example

```
Selected Function

↓

Find Incoming CALLS

↓

Find Outgoing CALLS

↓

Find Dependencies

↓

Find Dependents

↓

Calculate Impact
```

No file scanning is required.

Everything is graph traversal.

---

# One Graph, Multiple Views

One of the biggest advantages of the Knowledge Graph is that the repository only needs to be indexed once.

From the same graph,

multiple visualizations can be generated.

```
Knowledge Graph

│

├── Dependency Graph

├── Call Graph

├── Project Flow Graph

├── Impact Analysis

├── Architecture Summary

├── Repository Chat

└── Explain Code
```

Each feature simply filters different node types and edge relationships.

No duplicate processing is required.

---

# Why This Design?

Instead of building separate systems for

- Dependency Analysis
- Call Analysis
- Architecture Visualization
- AI Context
- Refactoring

everything shares the same underlying Knowledge Graph.

This provides several advantages.

## Single Source of Truth

Every feature reads from the same repository model.

---

## Better Scalability

Adding a new feature rarely requires re-indexing.

Only new graph traversals.

---

## Lower AI Cost

Many developer questions can be answered through graph traversal alone.

No LLM invocation required.

---

## Faster Performance

Graph traversal is significantly faster than repeatedly parsing source files.

---

## Extensibility

Future node types like

- Docker Containers
- Kubernetes Resources
- Kafka Topics
- API Gateways
- Load Balancers
- Redis Clusters

can be added without changing the overall architecture.

---

# Summary

The Knowledge Graph transforms a software repository from a collection of disconnected files into an interconnected software intelligence model.

Instead of understanding code one file at a time, the editor understands the repository as a complete system.

This graph serves as the foundation for architecture visualization, AI reasoning, repository-wide refactoring, impact analysis, semantic search, and every future intelligent feature built into AI Project Intelligence Editor.

# 📊 Architecture Visualization

One of the primary goals of AI Project Intelligence Editor is to make software architecture visible.

Modern software systems often contain hundreds of interconnected files, functions, components, APIs, services, utilities, middleware, caches, and databases.

Although all of these entities are connected, developers usually have to understand these relationships manually by navigating through source code.

This process becomes increasingly difficult as the project grows.

To solve this problem, AI Project Intelligence Editor automatically generates multiple architecture graphs from a single Knowledge Graph.

Each graph answers a different engineering question.

Instead of creating separate parsers for different visualizations, the project builds one centralized Knowledge Graph and derives specialized views from it.

```
                    Knowledge Graph
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
 Dependency Graph      Call Graph      Project Flow Graph
```

Although these graphs are generated from the same repository, each one focuses on a completely different aspect of the software.

---

# Why Three Different Graphs?

Software architecture cannot be fully understood using a single graph.

Consider a developer asking these three questions.

```
Question 1

Which files depend on this service?

↓

Dependency Graph
```

```
Question 2

Which functions call this function?

↓

Call Graph
```

```
Question 3

How does a request travel through the entire application?

↓

Project Flow Graph
```

These are three different software engineering problems.

Trying to represent all of them using one graph would produce an extremely cluttered and unreadable visualization.

Instead, each graph focuses on a single perspective.

---

# 1. Dependency Graph

## Purpose

The Dependency Graph explains the structural architecture of the project.

Instead of showing execution,

it shows ownership and dependencies between software modules.

It answers questions like

- Which file imports this file?
- Which modules depend on this service?
- Which utilities are reused throughout the project?
- Which files are tightly coupled?
- Which modules are isolated?
- Where do circular dependencies exist?

---

## Why is it Important?

Imagine deleting a utility file.

Before doing so, a developer should know

```
How many files import it?

↓

Which modules depend on it?

↓

Will deleting it break the project?
```

The Dependency Graph answers these questions instantly.

---

## Relationships Used

This graph is generated primarily from

```
FILE_IMPORTS_FILE

CONTAINS
```

relationships.

Example

```
Dashboard.tsx

↓

imports

↓

UserList.tsx

↓

imports

↓

useUsers.ts

↓

imports

↓

user.service.ts
```

Notice that this graph focuses only on software dependencies.

It does not care which function is executed first.

---

## Typical Use Cases

The Dependency Graph is useful for

- Refactoring
- Architecture Review
- Circular Dependency Detection
- Module Organization
- Code Cleanup
- Project Understanding
- New Developer Onboarding

---

# 2. Call Graph

## Purpose

The Call Graph explains runtime interactions.

Instead of asking

> "Which file imports this file?"

it asks

> "Which function calls this function?"

This graph models the runtime behavior of the application.

---

## Why is it Important?

Changing a single function can affect many other functions.

Example

```
createUser()

↓

called by

↓

UserService()

↓

called by

↓

UserController()

↓

called by

↓

Register API
```

Without a Call Graph,

developers must manually search the repository to understand this chain.

The editor performs this automatically.

---

## Relationships Used

The Call Graph is generated entirely from

```
CALLS
```

relationships.

Example

```
Dashboard()

↓

calls

↓

useUsers()

↓

calls

↓

getUsers()

↓

calls

↓

apiClient()
```

Unlike the Dependency Graph,

imports are ignored.

Only execution relationships matter.

---

## Impact Analysis

The Call Graph is also the foundation for one of the project's most powerful features:

```
Impact Analysis
```

Suppose a developer wants to modify

```
getUsers()
```

The editor automatically performs a reverse traversal of the Call Graph.

```
getUsers()

↑

useUsers()

↑

UserList()

↑

Dashboard()

↑

App()
```

The editor then reports

- Impact Score
- Affected Functions
- Upstream Callers
- Downstream Dependencies

before any code is modified.

This dramatically reduces the risk of breaking production code.

---

## Typical Use Cases

The Call Graph is useful for

- Function Tracing
- Debugging
- Impact Analysis
- Safe Refactoring
- Execution Understanding
- Dead Code Detection
- Runtime Navigation

---

# 3. Project Flow Graph

## Purpose

The Project Flow Graph explains the complete software execution journey.

Unlike the Dependency Graph or the Call Graph,

this graph focuses on user experience.

It answers questions such as

- What happens after clicking Login?
- How is a request processed?
- Which backend modules participate?
- Which services interact with Redis?
- Which database is accessed?
- Where does the response return?

Instead of visualizing code,

it visualizes application behavior.

---

## Why was this Graph Created?

Large applications usually contain dozens of independent features.

For example

- Login
- Registration
- Dashboard
- Payment
- Profile
- Search

Every feature follows its own execution pipeline.

Understanding these flows manually requires reading hundreds of files.

The Project Flow Graph automatically constructs these execution journeys.

---

## Example Flow

```
Browser

↓

Login Page

↓

Submit Button

↓

POST /login

↓

API Route

↓

Controller

↓

Authentication Service

↓

Redis Cache

↓

MongoDB

↓

JWT Generation

↓

HTTP Response

↓

Dashboard
```

Instead of reading source code,

developers can understand the complete feature visually.

---

## Current Implementation

The current implementation derives the execution path from repository relationships.

The graph identifies

- Entry Components
- Components
- Hooks
- Services
- Utility Functions
- API Clients
- Controllers
- Business Logic

and arranges them into a logical execution flow.

Although infrastructure components such as

- API Gateway
- Load Balancer
- Reverse Proxy

are not yet represented,

the architecture has been designed to support them in future versions.

---

## Future Vision

The long-term goal of the Project Flow Graph is to visualize the complete request lifecycle.

Example

```
Browser

↓

React

↓

Router

↓

Component

↓

Hook

↓

API Client

↓

API Gateway

↓

Load Balancer

↓

Express Route

↓

Controller

↓

Service

↓

Redis

↓

Database

↓

Business Logic

↓

HTTP Response

↓

React State

↓

UI Update
```

This would allow developers to understand an application's behavior from the browser all the way to the database and back.

---

# One Repository, Three Different Perspectives

Although all three graphs originate from the same Knowledge Graph,

they solve entirely different engineering problems.

| Graph | Answers | Primary Relationships |
|--------|----------|-----------------------|
| Dependency Graph | What depends on what? | FILE_IMPORTS_FILE, CONTAINS |
| Call Graph | Who calls whom? | CALLS |
| Project Flow Graph | How does the application execute? | CALLS + Repository Structure |

Because they share the same underlying Knowledge Graph,

the repository only needs to be indexed once.

Every visualization is generated dynamically by filtering different node types and relationships.

This design keeps the architecture modular, scalable, and efficient while providing multiple perspectives of the same software system.

---

# Design Philosophy

Most software visualization tools generate a single graph and overload it with every possible relationship.

The result is often too complex to understand.

AI Project Intelligence Editor takes a different approach.

Rather than creating one overwhelming graph, it generates multiple focused visualizations.

Each graph is designed to answer one category of engineering questions.

Together, these graphs provide developers with a comprehensive understanding of software architecture, runtime behavior, and application execution without requiring them to manually inspect hundreds of source files.

# 🤖 AI Intelligence Engine

The AI Intelligence Engine is responsible for transforming the repository from a collection of source files into an intelligent software assistant.

Unlike traditional AI coding assistants that rely solely on the currently opened file, AI Project Intelligence Editor combines static analysis, repository metadata, graph relationships, semantic retrieval, and Large Language Models to generate highly contextual responses.

Instead of asking the model to understand the repository from scratch every time, the editor first builds a structured understanding of the project and then supplies only the most relevant context.

This significantly improves

- Response Quality
- Context Accuracy
- Repository Awareness
- AI Cost
- Latency

---

# AI Philosophy

The editor follows one simple philosophy.

> **LLMs should generate knowledge, not discover it.**

Most AI assistants ask the language model to both

- discover context
- generate the answer

This leads to

- hallucinations
- missing dependencies
- incomplete understanding
- incorrect assumptions

Instead,

AI Project Intelligence Editor separates these responsibilities.

```
Repository

↓

Static Analysis

↓

Knowledge Graph

↓

Context Retrieval

↓

LLM

↓

Final Response
```

The AI never searches the repository blindly.

It receives structured software knowledge before reasoning.

---

# AI Pipeline

Every AI request follows the same processing pipeline.

```
Developer Question

↓

Intent Detection

↓

Repository Context Collection

↓

Knowledge Graph Traversal

↓

Relevant Chunk Retrieval

↓

Prompt Construction

↓

LLM

↓

AI Response
```

Each stage contributes additional information.

---

# Stage 1 — User Query

Everything begins with a natural language question.

Examples

```
Explain authentication.

Where is JWT verified?

How does payment work?

Rename createUser.

Explain Dashboard component.

Which APIs use Redis?
```

The question itself contains very little context.

The Repository Intelligence Engine enriches it before invoking AI.

---

# Stage 2 — Intent Detection

Different questions require different repository information.

Examples

```
Explain Code

↓

Need AST Metadata
```

```
Rename Symbol

↓

Need Graph Relationships
```

```
Repository Chat

↓

Need Semantic Retrieval
```

```
Impact Analysis

↓

Need Call Graph
```

The intent detector identifies the type of operation.

---

# Stage 3 — Context Collection

Before calling the LLM,

the editor gathers contextual information.

Possible context includes

```
Selected File

Selected Function

Node Metadata

Imports

Exports

Function Calls

Callers

Dependencies

Dependents

Architecture Summary
```

Instead of receiving one source file,

the AI receives repository knowledge.

---

# Stage 4 — Graph Traversal

The Knowledge Graph is then traversed.

Example

Suppose the developer asks

```
Explain useUsers()
```

The graph retrieves

```
useUsers()

↓

Called By

↓

UserList

↓

Dashboard

↓

App
```

It also retrieves

```
useUsers()

↓

Calls

↓

getUsers()

↓

apiClient()
```

The AI now understands where the function sits within the architecture.

---

# Stage 5 — Semantic Retrieval

Graph traversal alone is not enough.

The repository also contains source code.

Relevant semantic chunks are retrieved using embeddings.

Pipeline

```
Question

↓

Embedding

↓

Vector Search

↓

Relevant Chunks

↓

Prompt Builder
```

Only the most relevant chunks are selected.

This minimizes token usage.

---

# Stage 6 — Prompt Construction

The prompt sent to the LLM is carefully structured.

Instead of sending

```
One File
```

the editor sends

```
Developer Question

+

Relevant Code Chunks

+

Node Metadata

+

Graph Relationships

+

Architecture Context

+

Repository Summary
```

The LLM receives everything necessary to answer accurately.

---

# Stage 7 — LLM Reasoning

Once the prompt has been prepared,

the AI performs reasoning.

Typical tasks include

- Code Explanation
- Repository Question Answering
- Architecture Understanding
- Refactoring Suggestions
- Best Practices
- Design Improvements

The AI does not need to guess repository structure because it has already been provided.

---

# Stage 8 — Response Generation

The generated response is returned to the frontend.

Depending on the operation,

the editor may also display

- Related Nodes
- Dependency Graph
- Call Graph
- Impact Score
- Referenced Files

alongside the AI response.

---

# Explain Code

One of the core AI features is Explain Code.

Instead of simply describing source code,

the AI explains

- Purpose
- Responsibilities
- Inputs
- Outputs
- Dependencies
- Architectural Role
- Runtime Behavior

Pipeline

```
Selected Node

↓

Chunk Retrieval

↓

Graph Relationships

↓

Prompt Builder

↓

LLM

↓

Explanation
```

Example

```
Explain Dashboard Component
```

The AI explains

- What Dashboard does
- Which components it renders
- Which hooks it uses
- Which APIs it invokes
- How it fits into the application

---

# Repository Chat

Repository Chat allows developers to ask questions about the entire codebase.

Unlike traditional chatbots,

the repository itself becomes the knowledge source.

Example Questions

```
Explain authentication.

Show payment flow.

How are users created?

Which services use Redis?

How does dashboard loading work?
```

Pipeline

```
Question

↓

Embedding Search

↓

Knowledge Graph

↓

Prompt

↓

LLM

↓

Answer
```

---

# Why Combine Graph + RAG?

Many systems use Retrieval-Augmented Generation (RAG).

However,

RAG alone only retrieves similar documents.

It does not understand relationships.

Example

Suppose the retrieved chunk is

```
getUsers()
```

Traditional RAG knows

```
getUsers()
```

exists.

It does NOT know

```
Who calls it?

What depends on it?

Which API uses it?

Which component renders it?
```

The Knowledge Graph fills this gap.

```
Embedding Search

+

Knowledge Graph

↓

Repository Intelligence
```

This combination dramatically improves answer quality.

---

# AI Context Window Optimization

Sending the entire repository to an LLM is expensive.

Instead,

the editor selects only

- Relevant Chunks
- Related Nodes
- Important Relationships

This reduces

- Token Usage
- API Cost
- Latency

while improving response quality.

---

# Redis Integration

AI responses are cached.

Examples

```
Explain Dashboard

↓

Redis

↓

Cache Hit

↓

Instant Response
```

Repeated AI requests become nearly instantaneous.

---

# Hallucination Reduction

The editor minimizes hallucinations by ensuring that the model receives verified repository information.

Instead of asking the LLM

```
Guess how authentication works.
```

the editor provides

```
Authentication Controller

↓

JWT Middleware

↓

User Service

↓

Token Generator

↓

Related Source Code
```

The model reasons using repository facts rather than assumptions.

---

# Current AI Capabilities

The current AI engine supports

- Explain Code
- Repository Chat
- Architecture Understanding
- Graph-Aware Responses
- Contextual Repository Reasoning

Future versions will include

- AI Code Review
- Pull Request Analysis
- Bug Localization
- Security Analysis
- Performance Recommendations
- Architecture Refactoring
- Automated Documentation
- Test Case Generation

---

# AI Design Principles

The AI engine follows four fundamental principles.

## Repository-Aware

The AI understands the entire repository instead of individual files.

---

## Context-First

Repository context is collected before invoking the language model.

---

## Graph-Driven

Software relationships are obtained through graph traversal rather than AI inference.

---

## AI-Assisted

The language model focuses on reasoning and explanation rather than discovering repository structure.

---

# Summary

The AI Intelligence Engine combines static analysis, semantic retrieval, graph traversal, and Large Language Models into a single pipeline.

Rather than replacing traditional software engineering techniques, it enhances them.

By combining deterministic repository analysis with AI reasoning, AI Project Intelligence Editor provides responses that are more accurate, more contextual, and significantly more useful than conventional AI coding assistants that operate only on the currently opened file.

# 🔄 Rename Refactoring Engine

One of the most important features of AI Project Intelligence Editor is intelligent repository-wide symbol renaming.

Unlike a traditional text editor that performs simple string replacement, this editor understands the structure of the project before applying any changes.

The refactoring engine ensures that renaming a symbol updates every valid reference across the repository while avoiding unrelated identifiers.

---

# Why Traditional Find & Replace Fails

Suppose a project contains

```
createUser()
```

inside multiple files.

A simple text replacement

```
createUser

↓

registerUser
```

may accidentally modify

- comments
- documentation
- strings
- unrelated variables
- different functions with the same name

This often introduces new bugs.

---

# Repository-Aware Refactoring

Instead of searching text,

the editor searches the repository graph.

```
Selected Symbol

↓

Knowledge Graph

↓

Definition Node

↓

Reference Nodes

↓

Affected Files

↓

Apply Rename
```

Every rename operation is based on repository relationships rather than plain text.

---

# Rename Pipeline

Each rename request follows the same pipeline.

```
Developer selects symbol

↓

Identify Symbol Definition

↓

Locate References

↓

Validate References

↓

Generate File Changes

↓

Preview Changes

↓

Apply Refactor
```

No file is modified until every affected location has been identified.

---

# Symbol Identification

The first step is identifying the exact symbol.

Example

```
createUser()
```

Metadata

```
Node ID

File Path

Node Type

Definition Location
```

The Knowledge Graph uniquely identifies every function, class, component, and exported symbol.

---

# Repository Traversal

Once the symbol has been identified,

the graph is traversed.

Example

```
createUser()

↓

Called By

↓

UserService

↓

UserController

↓

Routes

↓

Dashboard
```

Every reference becomes part of the rename operation.

---

# Reference Resolution

The refactoring engine identifies

- Function Calls
- Imports
- Exports
- Component Usage
- Hook Usage
- Class References

Example

```
createUser()

↓

import { createUser }

↓

UserController

↓

POST /users

↓

Dashboard
```

Every valid reference is collected.

---

# Rename Preview

Before applying changes,

the editor prepares a preview.

Example

```
File

Old

New
```

```
user.service.ts

createUser()

↓

registerUser()
```

```
user.controller.ts

createUser()

↓

registerUser()
```

```
routes.ts

createUser

↓

registerUser
```

The developer can review all changes before applying them.

---

# Why Graph-Based Rename?

Traditional editors search files.

AI Project Intelligence Editor searches relationships.

Instead of asking

```
Where does this word appear?
```

it asks

```
Which repository nodes depend on this symbol?
```

This dramatically improves rename accuracy.

---

# Supported Symbol Types

The rename engine currently supports

- Functions
- Components
- Classes
- Variables
- Hooks
- Exported Symbols

Future versions will include

- Interfaces
- Enums
- Type Aliases
- Generic Types
- Database Models

---

# AI-Assisted Rename Suggestions

The AI can also recommend better names.

Example

```
create()

↓

createUser()
```

```
get()

↓

fetchUsers()
```

```
doWork()

↓

processPayment()
```

The suggestions are generated using repository context rather than dictionary-based replacements.

---

# Repository Consistency

The editor ensures repository consistency by updating every valid reference together.

Instead of leaving the project in a partially renamed state,

all related files remain synchronized.

This significantly reduces the chance of introducing compilation errors.

---

# Future Improvements

Planned enhancements include

- Cross-language refactoring
- Automatic import optimization
- Rename preview with visual diff
- Undo history
- Batch refactoring
- AI naming recommendations
- Safe conflict detection
- Git-aware rename operations

---

# Design Principles

The Rename Refactoring Engine follows three principles.

## Repository-Aware

Every rename operation is based on repository relationships rather than text matching.

---

## Safe

Only valid references are modified.

---

## Predictable

Developers can preview every affected file before changes are applied.

---

# Summary

The Rename Refactoring Engine transforms repository-wide renaming from a risky manual operation into a graph-driven automated workflow.

By combining AST analysis, the Knowledge Graph, and repository traversal, the editor performs accurate, context-aware refactoring that scales across the entire project.

# 🎯 Impact Analysis Engine

Understanding the consequences of changing a piece of code is one of the biggest challenges in large software projects.

Developers often hesitate before modifying a function because they don't know which parts of the application depend on it.

The Impact Analysis Engine solves this problem by traversing the repository's call graph and dependency graph to determine the complete effect of a code change.

Instead of guessing what might break, developers receive an exact list of affected functions, components, services, and modules before making any modifications.

---

# The Problem

Consider a repository containing thousands of files.

Suppose a developer wants to modify

```
createUser()
```

Questions immediately arise.

- Which APIs use this function?
- Which components depend on it?
- Which services call it?
- Which pages will be affected?
- Will this change break authentication?
- Is this function used by background jobs?

Finding these answers manually can take hours.

---

# Solution

The editor performs graph traversal over the repository.

```
Selected Function

↓

Call Graph

↓

Dependency Graph

↓

Affected Nodes

↓

Impact Report
```

Every node that depends directly or indirectly on the selected node becomes part of the impact analysis.

---

# Repository Traversal

Suppose the developer selects

```
createUser()
```

The repository graph might look like

```
Dashboard

↓

UserController

↓

UserService

↓

createUser()

↓

Database
```

The engine walks through every incoming and outgoing relationship.

This provides complete visibility into how the selected function interacts with the rest of the application.

---

# Upstream Impact

Upstream impact answers

> Who depends on this function?

Example

```
Dashboard

↓

UserController

↓

UserService

↓

createUser()
```

If

```
createUser()
```

changes,

the following nodes may also require updates.

- UserService
- UserController
- Dashboard

These are the callers of the selected function.

---

# Downstream Impact

Downstream impact answers

> What does this function depend on?

Example

```
createUser()

↓

Validation Service

↓

Database

↓

Logger
```

Changing

```
createUser()
```

may also require checking

- Validation
- Database interactions
- Logging
- External API calls

These are the dependencies of the selected function.

---

# Repository Impact Graph

The impact engine builds a focused graph.

```
Dashboard

↓

UserController

↓

UserService

↓

createUser()

↓

Validation

↓

Database

↓

Redis
```

Instead of visualizing the entire repository,

developers only see the affected portion.

---

# Impact Score

Each node receives an impact score.

Example

```
Function

Affected Nodes

Impact
```

```
logger()

↓

2

Low
```

```
createUser()

↓

15

Medium
```

```
authenticate()

↓

82

Critical
```

The score helps developers understand the overall risk of modifying a particular function.

---

# Critical Functions

Some functions are shared across the entire application.

Example

```
authenticate()

↓

Routes

↓

Middleware

↓

Controllers

↓

Services
```

Changing such functions affects a large portion of the repository.

The editor automatically identifies these as critical nodes.

---

# Safe Refactoring

Before applying changes,

developers can inspect

- affected files
- affected components
- affected APIs
- affected services
- affected utilities

This significantly reduces accidental regressions.

---

# AI-Assisted Impact Summary

Instead of showing only graph relationships,

the AI generates a natural language explanation.

Example

```
Changing createUser() will affect

• UserController
• Registration API
• Dashboard
• Analytics Service

Estimated impact:
Medium

Risk:
Input validation may require updates.
```

This allows developers to understand repository-wide effects without manually reading dozens of files.

---

# Repository Navigation

Every impacted node is clickable.

Developers can immediately navigate to

- Function Definition
- Component
- Service
- Route
- Utility
- Hook

This makes repository exploration significantly faster.

---

# Change Planning

Impact Analysis helps developers plan modifications before writing code.

Typical workflow

```
Select Function

↓

Analyze Impact

↓

Review Affected Nodes

↓

Open Related Files

↓

Apply Changes

↓

Verify
```

The result is a safer development workflow.

---

# Future Enhancements

Planned improvements include

- Estimated regression risk
- AI-generated testing recommendations
- Suggested files to review
- Automatic pull request summaries
- Code ownership analysis
- Dependency heat maps
- Circular impact detection
- Change complexity estimation

---

# Design Principles

The Impact Analysis Engine follows three principles.

## Graph-Based

Analysis is performed using repository relationships instead of text search.

---

## Repository-Wide

Every dependent node is discovered automatically.

---

## Predictive

Developers understand the consequences of changes before modifying the code.

---

# Summary

The Impact Analysis Engine transforms repository navigation from reactive debugging into proactive analysis.

By combining the Call Graph, Dependency Graph, and Knowledge Graph, the editor predicts how a change propagates through the repository, helping developers refactor large codebases with confidence while reducing regressions and improving development speed.

# 💬 AI Chat With Repository

Modern AI assistants are excellent at answering programming questions, but they struggle to understand an entire software project.

Without repository awareness, Large Language Models only analyze the code that is explicitly provided in the prompt. They cannot understand project architecture, relationships between files, execution flow, or why certain implementation decisions were made.

AI Project Intelligence Editor solves this problem by allowing developers to chat directly with their repository.

Instead of asking questions about individual files, developers can ask questions about the entire project.

---

# The Problem

Imagine opening a repository containing

- 3,000 files
- 250,000 lines of code
- hundreds of APIs
- dozens of services
- multiple frontend modules

Now imagine asking ChatGPT

```
How does authentication work?
```

Without repository knowledge, the model has no idea.

It doesn't know

- where authentication starts
- which middleware is used
- which services are called
- which database tables are accessed
- which APIs are protected

The answer becomes incomplete.

---

# Solution

The repository is indexed before the conversation begins.

```
Repository

↓

Parser

↓

Chunks

↓

Embeddings

↓

Knowledge Graph

↓

Vector Database

↓

LLM
```

Every question is answered using repository context instead of generic programming knowledge.

---

# Repository Understanding Pipeline

The AI follows a multi-stage retrieval pipeline.

```
User Question

↓

Intent Detection

↓

Repository Search

↓

Knowledge Graph Traversal

↓

Vector Retrieval

↓

Relevant Context

↓

LLM

↓

Final Answer
```

Instead of searching the internet,

the AI searches your repository.

---

# Example Questions

Developers can ask questions like

```
Where is authentication implemented?
```

```
How is payment processing handled?
```

```
Which files are responsible for user registration?
```

```
Explain the dashboard architecture.
```

```
Where is Redis used?
```

```
Which APIs call createUser()?
```

```
How is JWT generated?
```

```
Which components depend on UserService?
```

The AI answers using the indexed repository.

---

# Context Retrieval

The editor never sends the entire repository to the LLM.

Instead,

it retrieves only the most relevant pieces.

```
Question

↓

Embedding Search

↓

Top Relevant Chunks

↓

Knowledge Graph Expansion

↓

Context Assembly

↓

LLM
```

This keeps responses accurate while minimizing token usage.

---

# Knowledge Graph Integration

Traditional Retrieval-Augmented Generation (RAG) retrieves similar documents.

AI Project Intelligence Editor goes one step further.

It also retrieves repository relationships.

Example

```
UserController

↓

UserService

↓

createUser()

↓

Database
```

Even if the exact code is not retrieved,

the graph provides structural context.

---

# Repository-Aware Responses

Instead of giving generic explanations,

the AI produces repository-specific answers.

Example

Question

```
How does user registration work?
```

Response

```
User registration starts from

POST /users

↓

UserController

↓

UserService

↓

Validation

↓

Password Hashing

↓

Database

↓

Analytics

↓

Response
```

The explanation reflects the actual implementation inside the repository.

---

# Multi-File Understanding

Many features span multiple files.

Example

```
Route

↓

Controller

↓

Service

↓

Repository

↓

Database
```

The AI automatically combines information from every related file before generating an answer.

---

# Architecture-Aware Explanations

Because the repository has already been indexed,

the AI understands

- project structure
- execution flow
- dependencies
- function calls
- module relationships

This enables architecture-level explanations rather than isolated file summaries.

---

# Explain Entire Features

Developers can ask

```
Explain the payment system.
```

The AI collects

- Routes
- Controllers
- Services
- Database Operations
- External APIs
- Utilities

before generating a complete explanation.

---

# Intelligent Code References

Whenever possible,

responses include

- function names
- file paths
- services
- components
- routes

This allows developers to immediately locate the relevant implementation.

---

# Repository Navigation

Every AI answer can become a navigation point.

Example

```
Authentication

↓

auth.controller.ts

↓

login()

↓

JWTService

↓

Redis Cache
```

Developers can jump directly to the referenced files.

---

# Supported Queries

The AI currently supports

- Code Explanation
- Architecture Questions
- Feature Discovery
- Function Understanding
- Dependency Analysis
- Execution Flow
- Service Relationships
- API Discovery
- Component Relationships
- Repository Navigation

---

# Future Enhancements

Planned improvements include

- Conversation memory
- Multi-repository chat
- Pull request explanations
- AI-generated documentation
- Bug localization
- Test generation
- Code review suggestions
- Repository onboarding assistant
- Natural language code search

---

# Design Principles

The AI Chat Engine follows three principles.

## Repository-Aware

Every response is grounded in repository context rather than general programming knowledge.

---

## Context-Driven

Only relevant files are retrieved before querying the LLM.

---

## Explainable

Responses reference the actual project structure, making explanations transparent and verifiable.

---

# Summary

The AI Chat With Repository feature transforms a traditional code assistant into a repository intelligence system.

By combining vector search, the Knowledge Graph, repository indexing, and Large Language Models, the editor enables developers to ask natural language questions about an entire software project and receive accurate, context-aware answers grounded in the actual codebase.

# 🧠 AI Explain Code

Reading an unfamiliar codebase is one of the most time-consuming tasks for developers.

Even experienced engineers often spend hours understanding how a function works, why it exists, what dependencies it has, and how it interacts with the rest of the application.

The AI Explain Code feature automatically analyzes any selected function, component, class, or file and generates a human-readable explanation using both the source code and the repository context.

Instead of simply describing what the code looks like, the AI explains why it exists, how it works, where it is used, and what role it plays inside the project.

---

# The Problem

Consider opening a repository you've never seen before.

You encounter a function like

```ts
createUser()
```

Immediately, several questions arise.

- What does this function actually do?
- Why was it created?
- Where is it called?
- Which APIs depend on it?
- What database operations does it perform?
- What happens if I modify it?

Reading only the source code rarely answers all of these questions.

---

# Solution

The editor combines multiple sources of information before generating an explanation.

```
Selected Node

↓

Source Code

↓

Knowledge Graph

↓

Call Graph

↓

Dependency Graph

↓

Repository Context

↓

Large Language Model

↓

Natural Language Explanation
```

The AI understands both the implementation and the surrounding architecture.

---

# Code Analysis Pipeline

Every explanation follows the same workflow.

```
Developer selects code

↓

Retrieve Source Code

↓

Find Related Nodes

↓

Retrieve Dependencies

↓

Collect Call Information

↓

Build Repository Context

↓

Generate AI Explanation
```

Instead of explaining only one file, the AI understands how that file fits into the larger project.

---

# Repository-Aware Understanding

Suppose the developer selects

```
UserService.createUser()
```

The AI automatically retrieves

- source code
- imported modules
- exported symbols
- callers
- callees
- related APIs
- dependent components
- database interactions

The explanation therefore reflects the complete role of the function.

---

# Example

Developer selects

```
createUser()
```

The generated explanation might be

> This function is responsible for creating a new user account. It validates the incoming data, hashes the user's password, stores the user in the database, triggers analytics events, and returns the created user object. It is called from UserController during the registration workflow.

Instead of describing syntax, the AI explains behavior.

---

# Function Analysis

For functions, the AI explains

- Purpose
- Input Parameters
- Return Value
- Internal Logic
- Dependencies
- Side Effects
- Error Handling
- Callers
- Called Functions

Example

```
Function

↓

Validation

↓

Business Logic

↓

Database

↓

Response
```

---

# Component Analysis

React components are analyzed differently.

The AI explains

- Component responsibility
- Props
- State
- Hooks
- Child Components
- API Calls
- Rendering Logic

Example

```
Dashboard

↓

UserList

↓

useUsers()

↓

API

↓

Backend
```

This provides developers with a complete understanding of UI behavior.

---

# Service Analysis

Service files often contain business logic.

The AI identifies

- Database interactions
- External API usage
- Validation logic
- Caching
- Logging
- Authentication
- Utility usage

This makes backend services much easier to understand.

---

# Architecture Context

Instead of saying

> This function calls another function.

The AI explains

```
UserController

↓

UserService

↓

Repository

↓

MongoDB

↓

Analytics

↓

Response
```

Every explanation is grounded in repository architecture.

---

# Dependency Awareness

The explanation includes

### Incoming Dependencies

Who calls this code?

Example

```
Dashboard

↓

UserController

↓

createUser()
```

---

### Outgoing Dependencies

What does this code depend on?

Example

```
createUser()

↓

Validation

↓

Database

↓

Redis

↓

Logger
```

Developers immediately understand the position of the selected node.

---

# AI Summary

For every selected node, the editor generates

- Purpose
- Responsibilities
- Dependencies
- Call Flow
- Architectural Role
- Potential Risks

Instead of reading hundreds of lines of code, developers receive a concise explanation.

---

# Learning Tool

The Explain Code feature is especially useful for

- New Developers
- Students
- Open Source Contributors
- Code Reviews
- Large Legacy Projects
- Team Onboarding

Developers can understand unfamiliar code significantly faster.

---

# Repository Navigation

Every explanation references actual repository entities.

Example

```
createUser()

↓

UserController

↓

POST /users

↓

Dashboard
```

These references can be opened directly inside the editor.

---

# Future Enhancements

Planned improvements include

- Line-by-line explanations
- Sequence diagrams
- Automatic UML generation
- Design pattern detection
- Complexity analysis
- Performance recommendations
- Security analysis
- Refactoring suggestions
- AI-generated documentation

---

# Design Principles

The Explain Code Engine follows three principles.

## Context-Aware

Explanations use repository relationships rather than isolated source code.

---

## Human-Friendly

Complex implementation details are converted into natural language.

---

## Educational

The feature is designed to help developers understand both code behavior and architectural intent.

---

# Summary

The AI Explain Code feature transforms complex source code into clear, repository-aware explanations.

By combining source code analysis, the Knowledge Graph, Call Graph, Dependency Graph, and Large Language Models, the editor helps developers understand unfamiliar code quickly, navigate large repositories with confidence, and significantly reduce onboarding and debugging time.

# ⚡ Redis Caching

Modern AI-powered applications perform multiple computationally expensive operations before producing a response.

Repository indexing, graph generation, semantic search, architecture analysis, and AI explanations can become expensive if they are executed repeatedly for the same repository.

To eliminate unnecessary computation and improve response time, AI Project Intelligence Editor integrates Redis as an in-memory caching layer.

Instead of rebuilding repository intelligence for every request, frequently accessed information is served directly from Redis.

---

# Why Redis?

Without caching, every request requires multiple expensive operations.

```
Repository

↓

Parse Files

↓

Build Graph

↓

Generate Embeddings

↓

Query Database

↓

LLM

↓

Response
```

Many of these operations produce identical results for unchanged repositories.

Executing them repeatedly wastes CPU resources, increases database load, and slows down the application.

Redis eliminates this redundancy.

---

# High-Level Architecture

```
Client

↓

Backend API

↓

Redis Cache

↓

MongoDB

↓

LLM

↓

Response
```

Every request first checks Redis.

If cached data exists,

the backend immediately returns the cached result.

Otherwise,

the data is generated, stored in Redis, and then returned.

---

# Cache Workflow

```
Client Request

↓

Check Redis

↓

Cache Hit ?

↓

Yes
↓

Return Cached Data

No
↓

Generate Result

↓

Store in Redis

↓

Return Response
```

This dramatically reduces response time for repeated requests.

---

# What Gets Cached?

The editor caches expensive computations rather than raw source code.

Examples include

- Repository Metadata
- Indexed Repository Information
- Knowledge Graph
- Dependency Graph
- Call Graph
- Project Flow Graph
- Architecture Summary
- AI Explain Code Responses
- Repository Chat Context
- Embedding Search Results

---

# Repository Graph Cache

Building repository graphs requires traversing thousands of nodes and relationships.

Instead of rebuilding them every request,

the graph is cached.

```
Repository

↓

Knowledge Graph

↓

Redis

↓

Future Requests
```

Subsequent requests can reuse the graph instantly.

---

# AI Response Cache

Large Language Model responses are expensive.

Suppose a developer asks

```
Explain Authentication Flow
```

The generated explanation is cached.

Future requests for the same repository and same question can reuse the cached answer.

```
Question

↓

Redis

↓

AI Response
```

This reduces LLM calls and improves response time.

---

# Architecture Cache

Generating

- Dependency Graph
- Call Graph
- Project Flow
- Architecture Summary

requires multiple graph traversals.

These results rarely change unless the repository changes.

Therefore,

they are ideal candidates for caching.

---

# Embedding Cache

Semantic search generates embeddings and retrieves similar chunks.

Instead of performing identical vector searches repeatedly,

the retrieved context can also be cached.

```
Query

↓

Embedding Search

↓

Redis

↓

Retrieved Context
```

---

# Cache Keys

Every cached object is uniquely identified.

Example

```
workspace:{id}:graph
```

```
workspace:{id}:callgraph
```

```
workspace:{id}:dependencies
```

```
workspace:{id}:summary
```

```
workspace:{id}:chat:{hash}
```

```
workspace:{id}:explain:{nodeId}
```

Using structured cache keys prevents collisions while allowing efficient invalidation.

---

# Cache Invalidation

Repositories continuously evolve.

Whenever the repository is re-indexed,

the related cache entries are invalidated.

```
Repository Updated

↓

Re-index

↓

Delete Old Cache

↓

Generate Fresh Cache
```

This guarantees that developers always receive the latest repository information.

---

# Time-To-Live (TTL)

Not every cache entry needs to live forever.

Typical TTL strategy

| Data | TTL |
|------|------|
| Repository Metadata | 1 Hour |
| Knowledge Graph | 24 Hours |
| Dependency Graph | 24 Hours |
| Call Graph | 24 Hours |
| Architecture Summary | 12 Hours |
| AI Explain Code | 30 Minutes |
| Chat Responses | 30 Minutes |

The exact values can be tuned depending on repository activity.

---

# Performance Benefits

Without Redis

```
Request

↓

MongoDB

↓

Graph Traversal

↓

Vector Search

↓

LLM

↓

Response
```

With Redis

```
Request

↓

Redis

↓

Response
```

Most repeated requests avoid expensive computation entirely.

---

# Reduced Database Load

Repeated graph queries can heavily stress MongoDB.

Redis significantly reduces

- Database Reads
- Graph Traversals
- Repository Parsing
- Vector Searches

This allows MongoDB to focus on persistent storage rather than repeated computation.

---

# Faster AI Features

The following AI features become noticeably faster

- Explain Code
- Repository Chat
- Architecture Summary
- Graph Generation
- Impact Analysis

Developers experience much lower latency during repeated interactions.

---

# Scalability

Caching enables the system to scale more efficiently.

Without caching

```
100 Users

↓

100 Graph Builds

↓

100 AI Requests
```

With Redis

```
100 Users

↓

1 Graph Build

↓

Shared Cache

↓

100 Responses
```

The backend performs significantly less work while serving more users.

---

# Future Improvements

Future caching enhancements include

- Distributed Redis Cluster
- Cache Compression
- Partial Graph Caching
- Incremental Cache Updates
- Background Cache Warming
- Smart Cache Expiration
- Frequently Accessed Repository Detection
- Multi-Level Cache Architecture

---

# Design Principles

The Redis Caching Layer follows three principles.

## Fast

Frequently accessed data should be returned directly from memory.

---

## Consistent

Cache entries are automatically invalidated whenever the repository changes.

---

## Scalable

The cache reduces unnecessary computation, allowing the application to serve larger repositories and more concurrent users efficiently.

---

# Summary

Redis serves as the high-speed memory layer of AI Project Intelligence Editor.

By caching repository intelligence, graph structures, architecture summaries, semantic search results, and AI-generated responses, the system significantly reduces latency, minimizes database load, lowers AI computation costs, and delivers a much smoother developer experience.

Instead of rebuilding repository intelligence on every request, the editor intelligently reuses previously computed results, making repository exploration and AI-assisted development fast, responsive, and scalable.
