import CourseCard from "@/components/ui/course-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { btnPrimary, btnSecondary, FadeIn, Kicker, Panel } from "@/components/student-view/ui";
import { filterOptions, sortOptions } from "@/config";
import { cn } from "@/lib/utils";
import { fetchStudentViewCourseListService } from "@/services";
import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const SECTION_LABELS = {
  category: "Category",
  level: "Level",
  primaryLanguage: "Language",
};

function createSearchParamsHelper(filterParams) {
  const queryParams = [];

  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");

      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }

  return queryParams.join("&");
}

function FilterPanel({ filters, sort, setSort, onToggle, idPrefix }) {
  return (
    <div className="divide-y divide-[#E5E5E5]">
      <fieldset className="pb-5">
        <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Sort by</legend>
        <div className="grid gap-1">
          {sortOptions.map((option) => {
            const checked = sort === option.id;
            return (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-neutral-100",
                  checked ? "font-semibold text-[#0A0A0A]" : "text-neutral-600"
                )}
              >
                <input
                  type="radio"
                  name={`${idPrefix}-sort`}
                  value={option.id}
                  checked={checked}
                  onChange={() => setSort(option.id)}
                  className="h-4 w-4 accent-[#0A0A0A]"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      {Object.keys(filterOptions).map((sectionId) => (
        <fieldset key={sectionId} className="py-5 last:pb-0">
          <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
            {SECTION_LABELS[sectionId] || sectionId}
          </legend>
          <div className="grid gap-1">
            {filterOptions[sectionId].map((option) => {
              const id = `${idPrefix}-${sectionId}-${option.id}`;
              const checked = Boolean(filters?.[sectionId]?.includes(option.id));
              return (
                <Label
                  key={option.id}
                  htmlFor={id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm font-normal transition-colors hover:bg-neutral-100",
                    checked ? "font-semibold text-[#0A0A0A]" : "text-neutral-600"
                  )}
                >
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={() => onToggle(sectionId, option)}
                    className="rounded-[4px] border-neutral-400 data-[state=checked]:border-[#0A0A0A] data-[state=checked]:bg-[#0A0A0A] data-[state=checked]:text-white"
                  />
                  {option.label}
                </Label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function StudentViewCoursesPage({
  studentViewCoursesList,
  setStudentViewCoursesList,
  loadingState,
  setLoadingState,
}) {
  const [sort, setSort] = useState("price-lowtohigh");
  const [filters, setFilters] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  function handleFilterOnChange(getSectionId, getCurrentOption) {
    const current = filters?.[getSectionId] || [];
    const next = current.includes(getCurrentOption.id)
      ? current.filter((id) => id !== getCurrentOption.id)
      : [...current, getCurrentOption.id];
    const cpyFilters = { ...filters, [getSectionId]: next };

    setFilters(cpyFilters);
    sessionStorage.setItem("filters", JSON.stringify(cpyFilters));
  }

  function clearFilters() {
    setFilters({});
    sessionStorage.removeItem("filters");
  }

  async function fetchAllStudentViewCourses(filters, sort) {
    const query = new URLSearchParams({
      ...filters,
      sortBy: sort,
    });
    try {
      const response = await fetchStudentViewCourseListService(query);
      if (response?.success) {
        setStudentViewCoursesList(response?.data);
      }
    } catch (error) {
      console.error("Failed to load courses:", error?.response?.data?.message || error.message);
      setStudentViewCoursesList([]);
    } finally {
      setLoadingState(false);
    }
  }

  function handleCourseNavigate(getCurrentCourseId) {
    navigate(`/course/details/${getCurrentCourseId}`);
  }

  useEffect(() => {
    const buildQueryStringForFilters = createSearchParamsHelper(filters);
    setSearchParams(new URLSearchParams(buildQueryStringForFilters));
  }, [filters]);

  useEffect(() => {
    setSort("price-lowtohigh");
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, []);

  useEffect(() => {
    if (filters !== null && sort !== null)
      fetchAllStudentViewCourses(filters, sort);
  }, [filters, sort]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("filters");
    };
  }, []);

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event) {
      if (event.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const activeFilterCount = Object.values(filters || {}).reduce(
    (count, value) => count + (Array.isArray(value) ? value.length : 0),
    0
  );
  const resultCount = studentViewCoursesList?.length || 0;

  return (
    <div className="lms-page-shell pb-20">
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:pt-12 lg:px-8">
        <FadeIn>
          <Kicker>Catalogue</Kicker>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl">Find your next course</h1>
          <p className="mt-2 text-neutral-600">Filter by category, level or language, and sort the results.</p>
        </FadeIn>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          {/* Desktop filters */}
          <aside className="hidden w-64 shrink-0 lg:block" aria-label="Filters">
            <Panel className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-semibold text-[#171717]">Filters</p>
                {activeFilterCount > 0 ? (
                  <button type="button" onClick={clearFilters} className="text-sm text-neutral-500 underline-offset-4 hover:text-[#0A0A0A] hover:underline">
                    Clear all
                  </button>
                ) : null}
              </div>
              <FilterPanel filters={filters} sort={sort} setSort={setSort} onToggle={handleFilterOnChange} idPrefix="desktop" />
            </Panel>
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-5 flex items-center justify-between gap-3">
              <p className="text-sm text-neutral-600" aria-live="polite">
                {loadingState ? "Loading courses…" : `${resultCount} ${resultCount === 1 ? "course" : "courses"}`}
              </p>
              <Button
                variant="outline"
                className={cn(btnSecondary, "h-9 gap-2 px-4 lg:hidden")}
                onClick={() => setDrawerOpen(true)}
                aria-expanded={drawerOpen}
                aria-controls="filters-drawer"
              >
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
                Filters
                {activeFilterCount > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A0A0A] px-1.5 text-xs text-white">
                    {activeFilterCount}
                  </span>
                ) : null}
              </Button>
            </div>

            {loadingState ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/5] rounded-2xl bg-neutral-100" />
                ))}
              </div>
            ) : resultCount > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {studentViewCoursesList.map((courseItem) => (
                  <CourseCard
                    key={courseItem?._id}
                    course={courseItem}
                    onClick={() => handleCourseNavigate(courseItem?._id)}
                  />
                ))}
              </div>
            ) : (
              <Panel className="flex flex-col items-center px-6 py-16 text-center">
                <h2 className="text-lg font-bold tracking-tight text-[#171717]">No courses match these filters</h2>
                <p className="mt-2 max-w-sm text-sm text-neutral-600">
                  {activeFilterCount > 0
                    ? "Try removing a filter or two to see more results."
                    : "No courses have been published yet. Check back soon."}
                </p>
                {activeFilterCount > 0 ? (
                  <Button className={cn(btnPrimary, "mt-6 h-10")} onClick={clearFilters}>
                    Clear filters
                  </Button>
                ) : null}
              </Panel>
            )}
          </main>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="filters-drawer-title">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div
            id="filters-drawer"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,88vw)] flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
              <p id="filters-drawer-title" className="font-semibold text-[#171717]">Filters</p>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Close filters" onClick={() => setDrawerOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel filters={filters} sort={sort} setSort={setSort} onToggle={handleFilterOnChange} idPrefix="mobile" />
            </div>
            <div className="flex gap-2 border-t border-[#E5E5E5] p-4">
              <Button variant="outline" className={cn(btnSecondary, "h-10 flex-1")} onClick={clearFilters} disabled={activeFilterCount === 0}>
                Clear
              </Button>
              <Button className={cn(btnPrimary, "h-10 flex-1")} onClick={() => setDrawerOpen(false)}>
                Show {resultCount} {resultCount === 1 ? "course" : "courses"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default StudentViewCoursesPage;
