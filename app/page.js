import react from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, ArrowRight, CalendarCheck, ChartColumn, ClipboardList, FolderKanban, Mail, MapPinned, PhoneCall, Play, Star } from "lucide-react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const testimonials = [
  {
    name: "Robert Cutugno",
    role: "Global Sales Enablement Lead",
    company: "Moody's",
    quote:
      "What used to take us 4 hours to create now takes 30 minutes—and updates happen in seconds.",
    image: "/person1.png",
    logo: "Moody's",
  },
  {
    name: "Elizabeth Wright",
    role: "Global Solution Owner",
    company: "Mondelez",
    quote:
      "100 hours' worth of work in 10 minutes. Primary reduces assignment organization of teams to a few clicks.",
    image: "/person2.png",
    logo: "Mondelēz",
  },
  {
    name: "Tonya Braddock",
    role: "Executive Director",
    company: "Endo",
    quote:
      "Primary completely cleared up our operational bottlenecks, giving crystal-clear, real-time view of our entire project portfolio on a single screen.",
    image: "/person3.png",
    logo: "Endo",
  },
  {
    name: "Albert Benner",
    role: "Sales Department Director",
    company: "Endo",
    quote:
      "The automated sprint tracking and seamless developer handoffs slashed our deployment cycles by 25% with few missed requirement.",
    image: "/person4.png",
    logo: "Endo",
  },
  {
    name: "Eleyna Hashimoto",
    role: "Team Lead Designer",
    company: "Marble Studio",
    quote:
      "For the first time, our product, design, and engineering teams are fully aligned because everyone is tracking milestones against the exact same source of truth.",
    image: "/person5.png",
    logo: "Marble Studio",
  },
  {
    name: "Alexander Wu",
    role: "Market Research Head",
    company: "Harlington Co.",
    quote:
      "We swapped a messy web of spreadsheets for this platform, and our cross-departmental project delivery rate skyrocketed overnight.",
    image: "/person6.png",
    logo: "Harlington Co.",
  },
  {
    name: "Tonya Braddock5",
    role: "Solutions Department Head",
    company: "Manila Tech Inc.",
    quote:
      "As we scaled from ten employees to fifty, this tool kept our remote team completely synchronized and radically reduced our daily status meetings.",
    image: "/person7.png",
    logo: "Manila Tech Inc.",
  },
  {
    name: "Ronalyn Parka",
    role: "Feasibility Director",
    company: "Bandaria",
    quote:
      "Complications turned to dust with Primary. Tracking progress has never been easier, monitoring the tasks in real-time is helpful with overseas employees.",
    image: "/person8.png",
    logo: "Bandaria",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

        {/* Banner */}
        <div className="relative overflow-hidden h-130 w-full bg- py-20 border-b  bg-mist-100">
          <div className="container mx-auto px-4 py-16 flex flex-col justify-center md:flex-row items-center">
            <div className="md:w-1/2 z-10 gap-2">
              <h1 className="text-4xl md:text-9xl font-black text-lime-400 text-center mb-3 tracking-widest">PRIMARY</h1>
              <p className="text-zinc-700 text-sm md:text-base text-center">Best utility to handle your continuous succes. 
                Monitor your progress now and work with your team by leading them to greate achievements.
              </p>
            </div>
          </div> 
        </div>

        {/* Company Information */}
        <div className="container mx-auto bg-mist-100 p-10">
            <Card className="m-10 mt-0 rounded-md py-15 pt-5 px-10">
              <CardHeader>
                <CardTitle className="text-black text-center text-base md:text-4xl font-bold">Why Choose Primary?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black text-xs md:text-base">
            Managing complex projects shouldn’t require a degree in project management. Primary strips away the chaotic clutter of 
            traditional trackers, replacing messy spreadsheets and fragmented chats with a single, radically intuitive dashboard. 
            We bring your team’s tasks, timelines, and communication into a unified visual workspace where everyone instantly 
            knows what to do next. By automating the tedious updates and highlighting exactly where your attention is needed, 
            Primary turns daily friction into momentum—allowing you to focus less on managing the tool, and more on driving your 
            projects to the finish line.</p>
              </CardContent>
            </Card>
        </div>


        {/* Services */}
        <div className="container mx-auto">
            <Card className="bg-mist-200 m-10 rounded-md py-15 pt-5 px-10">
              <CardHeader className="flex justify-center">
                <CardTitle className="text-black text-center text-4xl font-extrabold">Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:w-auto xs:w-50 md:grid md:grid-flow-col md:grid-rows-2 gap-4">
                  <div className="flex flex-col justify-center items-center bg-zinc-300 rounded-md p-5">
                    <div className="rounded-full bg-lime-400 p-4"><FolderKanban /></div>
                    <label className="text-black text-lg font-bold">Project Management</label>
                    <p className="text-black text-base font-normal">Create, update, and track projects with real-time status and completion progress.</p>
                  </div>
                  <div className="flex flex-col justify-center items-center bg-zinc-300 rounded-md p-5">
                    <div className="rounded-full bg-lime-400 p-4"><ClipboardList /></div>
                    <label className="text-black text-lg font-bold">Task Management</label>
                    <p className="text-black text-base font-normal">Assign tasks, manage deadlines, and monitor overlapping schedules effortlessly.</p>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-zinc-300 rounded-md p-5">
                    <div className="rounded-full bg-lime-400 p-4"><ChartColumn /></div>
                    <label className="text-black text-lg font-bold">Progress Tracking</label>
                    <p className="text-black text-base font-normal">Visual tools show exactly where every project and task stands at a glance.</p>
                  </div>
                  
                  <div className="flex flex-col justify-center items-center bg-zinc-300 rounded-md p-5">
                    <div className="rounded-full bg-lime-400 p-4"><CalendarCheck /></div>
                    <label className="text-black text-lg font-bold">Deadline Monitoring</label>
                    <p className="text-black text-base font-normal">Automatic overlap detection and overdue alerts keep your timeline on track.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
        </div>


        {/* Testimonials */}
        <section className="mx-auto my-20 w-full bg-mist-100px-6 py-14 md:px-20">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div className="flex flex-col justify-center text-center md:text-start">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-lime-600">
                Trusted by top industry leaders.
              </p>

              <h2 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 md:text-5xl no-wrap">
                Why competitive industry leaders{" "}
                <span className="text-lime-400">trust Primary?</span>
              </h2>
            </div>
          </div>

          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-6">
              {testimonials.map((item) => (
                <CarouselItem
                  key={item.name}
                  className="pl-6 sm:basis-1/2 lg:basis-1/3"
                >
                  <Card className="relative h-120 w-auto overflow-hidden md:rounded-2xl border-0 p-0 shadow-none">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />

                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-black/20" />

                    <div className="absolute right-6 top-6 text-lg font-semibold text-white">
                      {item.logo}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                      <p className="mb-5 text-xl font-bold leading-tight">
                        “{item.quote}”
                      </p>
                      <p className="text-xs font-semibold">
                        {item.name},{" "}
                        <span className="font-normal text-white/80">
                          {item.role}, {item.company}
                        </span>
                      </p>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>

            <CarouselPrevious className="hidden md:inline-flex rounded-full border border-black/50 bg-mist-300"/>
            <CarouselNext className="hidden md:inline-flex rounded-full border border-black/50 bg-mist-300"/>
          </Carousel>
        </section>


        {/* Contact Us */}
        <section className="relative my-20 mb-0 min-h-180 overflow-hidden bg-mist-600">
          {/* Right-side full image */}
          <div className="absolute inset-y-0 right-0 w-[68%]">
            <Image
              src="/person_call.png"
              alt="Professional speaking with a client over the phone"
              fill
              sizes="68vw"
              className="object-cover"
            />
          </div>

          {/* Left floating card */}
          <div className="relative z-10 mx-auto flex min-h-180 max-w-7xl items-center px-6 md:px-20">
            <div className="w-full max-w-xl bg-transparent p-10 md:p-16">

            <Card className="gap-4">
              <CardHeader className=" flex justify-start">
                <CardTitle>
                  <h2 className="text-5xl font-black text-black">
                    Let&apos;s <span className="text-lime-400">talk.</span>
                  </h2>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="pb-2">
                    <label>Full Name <span className="text-destructive">*</span></label>
                    <Input required type="text" placeholder="Enter Legal Name" />
                  </div>
                  
                  <div className="pt-2">
                    <label>Contact Number <span className="text-destructive">*</span></label>
                    <Input required type="tel" placeholder="Enter Contact Number" />
                  </div>
                  
                  <div className="pt-2">
                    <label>Email <span className="text-destructive">*</span></label>
                    <Input required type="email" placeholder="Enter Email" />
                  </div>
                  
                  <div className="pt-2">
                    <label>Company (Optional)</label>
                    <Input type="text" placeholder="Enter Company Name" />
                  </div>
                  
                  <div className="pt-2">
                    <label>Message <span className="text-destructive">*</span></label>
                    <Textarea required placeholder="Enter Message" />
                  </div>

                </form>
              </CardContent>
              <CardFooter className="flex align-items-center justify-end">
                  <Button type="submit" className="bg-lime-400 text-black">Submit</Button>
              </CardFooter>
            </Card>
            </div>
          </div>
        </section>


        {/* Contact Info */}
        <section>
          <div className="py-10 px-10 grid grid-rows-3 bg-lime-500 gap-3 justify-center">
            <div className="flex flex-row justify-evenly items-center gap-2">
              <span>
                <MapPinned /> 
              </span>
              <span>3rd Floor Yulo Bldg., Banga Road, Brgy. Parian, Calamba City, Laguna</span>
            </div>
            <div className="flex flex-row justify-evenly aling-items-center gap-4 p-3">
              <span className="mx-3 text-lg align-items-center">Instagram <i className="fa-brands fa-instagram"></i></span>
              <span className="mx-3 text-lg align-items-center">|</span>
              <span className="mx-3 text-lg align-items-center">Facebook <i className="fa-brands fa-facebook"></i></span>
              <span className="mx-3 text-lg align-items-center">|</span>
              <span className="mx-3 text-lg align-items-center"><i className="fa-brands fa-x-twitter"></i></span>
            </div>
            <div className="flex flex-row justify-evenly items-center gap-6">
              <div className="flex flex-row gap-1">
                <span><PhoneCall /></span>
                <span>09463251459</span>
              </div>
              <div className="flex flex-row gap-1">
                <span><Mail /></span>
                <span>Primary@bsns.com</span>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}
