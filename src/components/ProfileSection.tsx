import Image from "next/image";

const ProfileSection = () => {
    return (
        <section id="about" className="py-24 bg-secondary/5">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="order-2 md:order-1 relative">
                        <div className="absolute -top-10 -left-10 w-40 h-40 border-8 border-primary/10 rounded-full animate-spin-slow"></div>
                        <div className="relative z-10 rounded-full overflow-hidden w-64 h-64 md:w-96 md:h-96 mx-auto border-8 border-white shadow-2xl">
                            <Image
                                src="/assets/arav_photo.png"
                                alt="Arav - Demonlord"
                                width={500}
                                height={500}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    </div>

                    <div className="order-1 md:order-2">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-4">Our Vision</h2>
                        <h3 className="text-4xl md:text-5xl font-bold mb-8 leading-tight tracking-tighter">
                            Defining the <span className="gradient-text">Future</span> of <br />
                            Digital Excellence.
                        </h3>
                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                            At Demonlord, we believe that every pixel tells a story. Our approach combines
                            the analytical precision of modern engineering with the creative soul of
                            traditional craftsmanship.
                        </p>
                        <div className="grid grid-cols-2 gap-6 mt-10">
                            <div className="p-6 rounded-2xl bg-white shadow-lg shadow-black/5 hover-lift smooth-transition">
                                <p className="text-3xl font-bold gradient-text mb-2">100%</p>
                                <p className="text-sm font-medium text-muted-foreground">Premium Quality</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white shadow-lg shadow-black/5 hover-lift smooth-transition">
                                <p className="text-3xl font-bold gradient-text mb-2">24/7</p>
                                <p className="text-sm font-medium text-muted-foreground">Global Support</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfileSection;
