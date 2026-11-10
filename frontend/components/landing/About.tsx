
import {
  GraduationCap,
  Target,
  Lightbulb,
  WifiOff,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description:
      "To make learning easier by helping university students turn complex lecture materials into understandable and engaging learning resources.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: Lightbulb,
    title: "Our Approach",
    description:
      "We combine AI-powered content analysis with different learning formats to help students understand, practise and retain knowledge.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: WifiOff,
    title: "Accessibility Matters",
    description:
      "We recognise that internet connectivity can be a challenge. That's why offline access and a lightweight experience are important parts of LearnLite.",
    color: "bg-green-50 text-green-700",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Section Heading */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
              <GraduationCap size={17} />
              About LearnLite AI
            </span>

            <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
              Making learning easier for every student.
            </h2>

            <p className="mt-6 text-base leading-8 text-gray-600">
              Understanding lecture materials shouldnt feel
              overwhelming. Yet many university students
              struggle to grasp complex topics, especially
              when learning resources are difficult to process
              or internet access is limited.
            </p>

            <p className="mt-4 text-base leading-8 text-gray-600">
              LearnLite AI is designed to bridge that gap.
              By transforming lecture notes and academic
              documents into summaries, flashcards and quizzes,
              we help students approach learning with greater
              clarity and confidence.
            </p>

          </div>

          {/* Visual Panel */}
          <div className="relative overflow-hidden rounded-3xl bg-[#e9f6f0] p-6 sm:p-10">

            <div className="mx-auto max-w-sm">

              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-teal-700">
                  <GraduationCap size={26} />
                </span>

                <div>
                  <p className="font-bold text-gray-900">
                    LearnLite AI
                  </p>
                  <p className="text-xs text-gray-500">
                    Learn smarter, not harder.
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                  Your learning journey
                </p>

                <h3 className="mt-3 text-2xl font-bold text-gray-900">
                  Understand more. Remember better.
                </h3>

                <div className="mt-6 space-y-4">

                  <div className="flex items-center gap-3 rounded-xl bg-[#faf7f2] p-3">
                    <FileIcon />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Simplified summaries
                      </p>
                      <p className="text-xs text-gray-500">
                        Understand key concepts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-[#faf7f2] p-3">
                    <BookOpen size={22} className="text-orange-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Interactive learning
                      </p>
                      <p className="text-xs text-gray-500">
                        Practise and retain knowledge
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-[#faf7f2] p-3">
                    <WifiOff size={22} className="text-green-700" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Offline accessibility
                      </p>
                      <p className="text-xs text-gray-500">
                        Keep learning anywhere
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Mission Cards */}
        <div className="mt-16 grid gap-5 md:grid-cols-3">

          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="rounded-2xl border border-gray-200 p-6 sm:p-7"
              >
                <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${value.color}`}>
                  <Icon size={24} />
                </span>

                <h3 className="mt-5 text-xl font-bold text-gray-900">
                  {value.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {value.description}
                </p>
              </article>
            );
          })}

        </div>

      </div>
    </section>
  );
}

function FileIcon() {
  return <BookOpen size={22} className="text-teal-700" />;
}