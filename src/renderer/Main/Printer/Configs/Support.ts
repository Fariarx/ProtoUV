export class SupportPreset
{
	public static Default = () => {
		return new SupportPreset('Default', 0.4, 0.4, 0.4, 3, 10, 3, 0, 3);
	};

	public constructor(
    public Name: string,
    // all diameters
    public ConnectionSphere: number,
    public Head: number,
    public Body: number,
    public Platform: number,
    public Density: number,
    public Rays: number,
    public Deepening: number,
    public StickingDistance: number)
	{ }
}
