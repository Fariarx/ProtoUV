export class SupportPreset
{
	public static Default = () => {
		return new SupportPreset('Default',
			0.5, 0.4, 0.5, 0.8, 3, 56, 3, 0.8, 10, 3, 1, 5);
	};

	public constructor(
    public Name: string,
    // all diameters
    public ConnectionSphere: number,
    public Head: number,
    public Body: number,
    public Indent: number,
    public RetreatFromTheWalls: number,
    public Angle: number,
    public PlatformWidth: number,
    public PlatformHeight: number,
    public Density: number,
    public Rays: number,
    public Sticking: number,
    public Lifting: number,)
	{ }
}
