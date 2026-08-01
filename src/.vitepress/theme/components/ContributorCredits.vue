<script setup lang="ts">
import { computed, ref } from 'vue'
import contributorData from '../../data/contributors.json'

interface Contributor {
  name: string
  note?: string
  url?: string
}

interface ContributorGroup {
  role: string
  members: Contributor[]
}

interface ContributorProject {
  id: string
  name: string
  description: string
  repository?: string
  groups: ContributorGroup[]
}

const projects = contributorData.projects as ContributorProject[]
const activeProjectId = ref(projects[0]?.id ?? '')
const searchQuery = ref('')

const activeProject = computed(
  () => projects.find((project) => project.id === activeProjectId.value) ?? projects[0],
)

const filteredGroups = computed(() => {
  const query = searchQuery.value.trim().toLocaleLowerCase()
  if (!query) return activeProject.value?.groups ?? []

  return (activeProject.value?.groups ?? [])
    .map((group) => {
      if (group.role.toLocaleLowerCase().includes(query)) return group

      return {
        ...group,
        members: group.members.filter((member) =>
          [member.name, member.note]
            .filter(Boolean)
            .some((value) => value!.toLocaleLowerCase().includes(query)),
        ),
      }
    })
    .filter((group) => group.members.length > 0)
})

const visibleCount = computed(() =>
  filteredGroups.value.reduce((total, group) => total + group.members.length, 0),
)

function getContributorCount(project: ContributorProject) {
  return project.groups.reduce((total, group) => total + group.members.length, 0)
}

function selectProject(projectId: string) {
  activeProjectId.value = projectId
  searchQuery.value = ''
}
</script>

<template>
  <section v-if="activeProject" class="credits" aria-label="Majdata 贡献者名单">
    <header class="credits__header">
      <div>
        <p class="credits__eyebrow">MAJDATA / CREDITS ARCHIVE</p>
        <p class="credits__intro">每一个名字，都是 Majdata 成长轨迹的一部分。</p>
      </div>
      <span class="credits__total" aria-label="项目数量">
        <strong>{{ projects.length }}</strong>
        <small>PROJECTS</small>
      </span>
    </header>

    <div class="credits__tabs" role="tablist" aria-label="选择项目">
      <button
        v-for="(project, projectIndex) in projects"
        :id="`credits-tab-${project.id}`"
        :key="project.id"
        class="project-tab"
        :class="{ 'project-tab--active': project.id === activeProjectId }"
        type="button"
        role="tab"
        :aria-controls="`credits-panel-${project.id}`"
        :aria-selected="project.id === activeProjectId"
        @click="selectProject(project.id)"
      >
        <span class="project-tab__index">{{ String(projectIndex + 1).padStart(2, '0') }}</span>
        <span class="project-tab__name">{{ project.name }}</span>
        <span class="project-tab__count">{{ getContributorCount(project) }} 项署名</span>
      </button>
    </div>

    <div
      :id="`credits-panel-${activeProject.id}`"
      class="credits__panel"
      role="tabpanel"
      :aria-labelledby="`credits-tab-${activeProject.id}`"
    >
      <div class="project-heading">
        <div>
          <p class="project-heading__label">CURRENT PROJECT</p>
          <h3>{{ activeProject.name }}</h3>
          <p>{{ activeProject.description }}</p>
        </div>
        <a
          v-if="activeProject.repository"
          class="project-heading__repo"
          :href="activeProject.repository"
          target="_blank"
          rel="noreferrer"
        >
          查看仓库
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </a>
      </div>

      <div class="credits__toolbar">
        <label class="credits-search">
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span class="sr-only">搜索名字或分工</span>
          <input v-model="searchQuery" type="search" placeholder="搜索名字或分工…" />
          <button
            v-if="searchQuery"
            type="button"
            aria-label="清除搜索"
            @click="searchQuery = ''"
          >
            ×
          </button>
        </label>
        <p class="credits__result" aria-live="polite">
          <strong>{{ visibleCount }}</strong>
          <span>{{ searchQuery ? '项匹配' : '项署名' }}</span>
        </p>
      </div>

      <div v-if="filteredGroups.length" class="credit-groups">
        <article
          v-for="(group, groupIndex) in filteredGroups"
          :key="group.role"
          class="credit-group"
          :class="{ 'credit-group--wide': group.members.length >= 6 }"
        >
          <header class="credit-group__header">
            <span>{{ String(groupIndex + 1).padStart(2, '0') }}</span>
            <h4>{{ group.role }}</h4>
            <small>{{ group.members.length }}</small>
          </header>
          <ul class="credit-group__members">
            <li v-for="member in group.members" :key="`${group.role}-${member.name}`">
              <a v-if="member.url" :href="member.url" target="_blank" rel="noreferrer">
                <span>{{ member.name }}</span>
                <small v-if="member.note">{{ member.note }}</small>
              </a>
              <span v-else>
                <span>{{ member.name }}</span>
                <small v-if="member.note">{{ member.note }}</small>
              </span>
            </li>
          </ul>
        </article>
      </div>

      <div v-else class="credits-empty">
        <span>NO MATCH</span>
        <p>没有找到“{{ searchQuery }}”</p>
        <button type="button" @click="searchQuery = ''">清除搜索</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.credits {
  --credits-accent: #ec6fa9;
  --credits-accent-soft: rgba(236, 111, 169, 0.12);
  position: relative;
  margin: 24px 0 48px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 24px;
  background:
    radial-gradient(circle at 92% -8%, rgba(153, 211, 251, 0.28), transparent 30%),
    var(--vp-c-bg-soft);
}

.credits::before {
  position: absolute;
  top: 0;
  right: 22px;
  width: 84px;
  height: 6px;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(90deg, var(--credits-accent), #99d3fb);
  content: '';
}

.credits__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 30px 32px 24px;
}

.credits__eyebrow,
.project-heading__label {
  margin: 0;
  color: var(--credits-accent);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.credits__intro {
  margin: 7px 0 0;
  color: var(--vp-c-text-1);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.5;
}

.credits__total {
  display: grid;
  flex: 0 0 auto;
  min-width: 68px;
  color: var(--vp-c-text-2);
  text-align: right;
}

.credits__total strong {
  color: var(--vp-c-text-1);
  font-size: 32px;
  font-weight: 900;
  line-height: 1;
}

.credits__total small {
  margin-top: 6px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.12em;
}

.credits__tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  padding: 1px 0;
  border-block: 1px solid var(--vp-c-divider);
  background: var(--vp-c-divider);
}

.project-tab {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 2px 14px;
  min-width: 0;
  padding: 17px 22px;
  border: 0;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  text-align: left;
  cursor: pointer;
  transition: background 180ms ease, color 180ms ease;
}

.project-tab::after {
  position: absolute;
  right: 22px;
  bottom: -1px;
  left: 22px;
  height: 3px;
  border-radius: 3px 3px 0 0;
  background: var(--credits-accent);
  content: '';
  opacity: 0;
  transform: scaleX(0.55);
  transition: opacity 180ms ease, transform 180ms ease;
}

.project-tab:hover,
.project-tab--active {
  background: color-mix(in srgb, var(--vp-c-bg) 88%, var(--credits-accent));
  color: var(--vp-c-text-1);
}

.project-tab--active::after {
  opacity: 1;
  transform: scaleX(1);
}

.project-tab:focus-visible,
.credits-search:focus-within,
.credits-empty button:focus-visible,
.project-heading__repo:focus-visible {
  outline: 2px solid var(--credits-accent);
  outline-offset: -2px;
}

.project-tab__index {
  grid-row: 1 / 3;
  align-self: center;
  color: var(--credits-accent);
  font-size: 12px;
  font-weight: 800;
}

.project-tab__name {
  overflow: hidden;
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-tab__count {
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.credits__panel {
  padding: 28px 32px 32px;
}

.project-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.project-heading h3 {
  margin: 6px 0 0;
  border: 0;
  font-size: clamp(26px, 5vw, 38px);
  font-weight: 900;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.project-heading p:last-child {
  max-width: 570px;
  margin: 10px 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.project-heading__repo {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 6px;
  padding: 9px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 180ms ease, background 180ms ease;
}

.project-heading__repo:hover {
  border-color: var(--credits-accent);
  background: var(--credits-accent-soft);
}

.project-heading__repo svg {
  width: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.8;
}

.credits__toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 26px 0 18px;
}

.credits-search {
  display: flex;
  flex: 1 1 auto;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 0 13px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  transition: border-color 180ms ease, box-shadow 180ms ease;
}

.credits-search:focus-within {
  border-color: var(--credits-accent);
  box-shadow: 0 0 0 3px var(--credits-accent-soft);
}

.credits-search svg {
  flex: 0 0 auto;
  width: 18px;
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-linecap: round;
  stroke-width: 1.8;
}

.credits-search input {
  min-width: 0;
  width: 100%;
  height: 42px;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 13px;
}

.credits-search input::placeholder {
  color: var(--vp-c-text-3);
}

.credits-search input::-webkit-search-cancel-button {
  display: none;
}

.credits-search button {
  padding: 4px;
  border: 0;
  background: none;
  color: var(--vp-c-text-3);
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
}

.credits__result {
  display: flex;
  flex: 0 0 auto;
  align-items: baseline;
  gap: 5px;
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 11px;
}

.credits__result strong {
  color: var(--vp-c-text-1);
  font-size: 22px;
  font-weight: 900;
}

.credit-groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.credit-group {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 94%, transparent);
  box-shadow: 0 8px 22px rgba(30, 35, 50, 0.035);
  transition: border-color 180ms ease, transform 180ms ease;
}

.credit-group:hover {
  border-color: color-mix(in srgb, var(--credits-accent) 50%, var(--vp-c-divider));
  transform: translateY(-2px);
}

.credit-group--wide {
  grid-column: 1 / -1;
}

.credit-group__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding-bottom: 11px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.credit-group__header > span {
  color: var(--credits-accent);
  font-size: 10px;
  font-weight: 900;
}

.credit-group__header h4 {
  overflow: hidden;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.credit-group__header small {
  display: grid;
  width: 21px;
  height: 21px;
  place-items: center;
  border-radius: 50%;
  background: var(--credits-accent-soft);
  color: var(--credits-accent);
  font-size: 10px;
  font-weight: 800;
}

.credit-group__members {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 13px 0 0;
  padding: 0;
  list-style: none;
}

.credit-group__members li {
  margin: 0;
}

.credit-group__members li > span,
.credit-group__members a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.25;
  text-decoration: none;
}

.credit-group__members a:hover {
  border-color: var(--credits-accent);
  color: var(--credits-accent);
}

.credit-group__members small {
  padding-left: 6px;
  border-left: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.credits-empty {
  display: grid;
  min-height: 230px;
  place-items: center;
  align-content: center;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 14px;
  text-align: center;
}

.credits-empty span {
  color: var(--credits-accent);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.credits-empty p {
  margin: 8px 0 15px;
  color: var(--vp-c-text-2);
  font-size: 14px;
}

.credits-empty button {
  padding: 8px 12px;
  border: 0;
  border-radius: 9px;
  background: var(--credits-accent-soft);
  color: var(--credits-accent);
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .credits {
    border-radius: 18px;
  }

  .credits__header,
  .credits__panel {
    padding-right: 18px;
    padding-left: 18px;
  }

  .credits__header {
    padding-top: 24px;
  }

  .credits__intro {
    font-size: 16px;
  }

  .credits__tabs,
  .credit-groups {
    grid-template-columns: 1fr;
  }

  .project-tab {
    padding: 14px 18px;
  }

  .project-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .credits__toolbar {
    align-items: stretch;
    flex-direction: column;
    gap: 8px;
  }

  .credits__result {
    justify-content: flex-end;
  }

  .credit-group--wide {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-tab,
  .project-tab::after,
  .project-heading__repo,
  .credits-search,
  .credit-group {
    transition: none;
  }
}
</style>
