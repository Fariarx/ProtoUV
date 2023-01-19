export class SupportPreset
{
	public static Default = () => {
		return new SupportPreset('Default', 0.4, 0.4, 0.4, 3, 1, 0.8, 3);
	};

	public constructor(
    public Name: string,
    // all diameters
    public ConnectionSphere: number,
    public Head: number,
    public Body: number,
    public Platform: number,
    public Density: number,
    public Padding: number,
    public Rays: number)
	{ }
}
