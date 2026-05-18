namespace Hinet.Service.Dto
{
    public class DropdownOption
    {
        public string? Value { get; set; }
        public string? Label { get; set; }
        public bool Selected { get; set; }
        public int? Priority { get; set; }
    }
    public  class DropdownOptionTree
    {
        public string? Value { get; set; }
        public string? Title { get; set; }

        public bool Disabled { get; set; } = false;
        public List<DropdownOptionTree>? Children { get; set; }
    }
}