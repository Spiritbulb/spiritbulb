import { Card, CardContent } from "@/components/ui/card";

interface Testimonial {
    name: string;
    role: string;
    content: string;
    platform: string;
}

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
    return (
        <Card className="w-[350px] shrink-0">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        "{testimonial.content}"
                    </p>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                        </div>
                        <img src={testimonial.platform} alt="Platform" className="w-auto h-12" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}