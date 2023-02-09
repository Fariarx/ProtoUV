export class SupportPreset
{
	public static Default = () => {
		return new SupportPreset('Default',
			0.4, 0.35, 0.5, 0.7, 56, 3, 0.6, 10, 3, 5);
	};

	public constructor(
    public Name: string,
    // all diameters
    public ConnectionSphere: number,
    public Head: number,
    public Body: number,
    public Indent: number,
    public Angle: number,
    public PlatformWidth: number,
    public PlatformHeight: number,
    public Density: number,
    public Rays: number,
    public Lifting: number,)
	{ }
}
