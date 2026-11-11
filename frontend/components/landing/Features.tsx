
import {
  FileText,
  Layers,
  Brain,
  MessageCircle,
  WifiOff,
  Camera,
  ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "AI-Powered Summaries",
    description:
      "Transform lengthy lecture materials into clear, concise summaries that help you understand important concepts faster.",
    color: "bg-teal-50 text-teal-700",
  },
  {
    icon: Layers,
    title: "Smart Flashcards",
    description:
      "Turn your study materials into flashcards and strengthen your memory through active recall.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Brain,
    title: "Interactive Quizzes",
    description:
      "Challenge yourself with AI-generated questions and track how well you understand your topics.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: MessageCircle,
    title: "Your AI Study Tutor",
    description:
      "Ask questions about your uploaded materials and receive helpful explanations through conversational learning.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: WifiOff,
    title: "Learn Even Offline",
    description:
      "Save generated learning resources and access them later, even when your internet connection is unavailable.",
    color: "bg-green-50 text-green-700",
  },
  {
    icon: Camera,
    title: "Flexible Note Capture",
    description:
      "Start learning your way. Upload academic documents, capture handwritten notes or paste text directly.",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="bg-white py-20 md:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">

        {/* Section Heading */}
        <div className="mx-auto max-w-2xl text-center">

          <span className="inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-700">
            Everything you need
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            One platform.
            <span className="text-teal-600">
              {" "}Smarter ways to learn.
            </span>
          </h2>

          <p className="mt-5 text-base leading-7 text-gray-600 sm:text-lg">
            From understanding difficult lecture notes to
            testing your knowledge, LearnLite brings your
            learning experience together in one place.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-2xl border border-gray-200 bg-[#faf7f2] p-6 transition-colors hover:border-teal-200 hover:bg-white sm:p-7"
              >
                <div className="flex items-center justify-between">

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon size={23} />
                  </div>

                  <span className="text-sm font-medium text-gray-300">
                    0{index + 1}
                  </span>

                </div>

                <h3 className="mt-7 text-xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-gray-600">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center justify-end">
                  <ArrowUpRight
                    size={19}
                    className="text-gray-400 transition-colors group-hover:text-teal-600"
                  />
                </div>
              </article>
            );
          })}

        </div>
      </div>
    </section>
  );
}