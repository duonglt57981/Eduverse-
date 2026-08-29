using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace Eduverse.Service.ElasticsearchService
{
    /// <summary>
    /// Expands common course-domain abbreviations and Vietnamese/English terms.
    /// The expansion happens at query time, so it also works with an existing index.
    /// </summary>
    public static class CourseSearchVocabulary
    {
        private const int MaxVariants = 16;

        private static readonly string[][] TermGroups =
        {
            new[] { "javascript", "js", "ecmascript" },
            new[] { "typescript", "ts" },
            new[] { "python", "py" },
            new[] { "c#", "c sharp", "csharp", ".net", "dotnet", "asp.net", "aspnet" },
            new[] { "c++", "cpp", "c plus plus" },
            new[] { "artificial intelligence", "ai", "trí tuệ nhân tạo" },
            new[] { "machine learning", "ml", "học máy" },
            new[] { "deep learning", "dl", "học sâu" },
            new[] { "data science", "khoa học dữ liệu" },
            new[] { "data analytics", "data analysis", "phân tích dữ liệu" },
            new[] { "database", "db", "cơ sở dữ liệu" },
            new[] { "frontend", "front end", "front-end", "lập trình giao diện" },
            new[] { "backend", "back end", "back-end", "lập trình máy chủ" },
            new[] { "fullstack", "full stack", "full-stack" },
            new[] { "user interface", "ui", "giao diện người dùng" },
            new[] { "user experience", "ux", "trải nghiệm người dùng" },
            new[] { "cloud computing", "cloud", "điện toán đám mây" },
            new[] { "cybersecurity", "cyber security", "an ninh mạng", "bảo mật mạng" },
            new[] { "quality assurance", "qa", "software testing", "kiểm thử phần mềm" },
            new[] { "internet of things", "iot" },
            new[] { "react", "reactjs", "react.js" },
            new[] { "node", "nodejs", "node.js" },
            new[] { "nextjs", "next.js" },
            new[] { "vue", "vuejs", "vue.js" },
            new[] { "spring boot", "springboot" },
            new[] { "sql server", "mssql" },
            new[] { "postgresql", "postgres", "psql" },
            new[] { "kubernetes", "k8s" }
        };

        private static readonly IReadOnlyList<IReadOnlyList<string>> NormalizedGroups =
            TermGroups
                .Select(group => group
                    .Select(Normalize)
                    .Distinct(StringComparer.Ordinal)
                    .ToArray())
                .ToArray();

        private static readonly IReadOnlyList<(string Term, IReadOnlyList<string> Group)> Aliases =
            NormalizedGroups
                .SelectMany(group => group.Select(term => (Term: term, Group: group)))
                .OrderByDescending(item => item.Term.Length)
                .ToArray();

        public static IReadOnlyList<string> GetSearchVariants(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return Array.Empty<string>();
            }

            var original = keyword.Trim();
            var normalizedKeyword = Normalize(original);
            var variants = new List<string> { original };
            var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { original };

            foreach (var (term, group) in Aliases)
            {
                if (variants.Count >= MaxVariants || !ContainsWholeTerm(normalizedKeyword, term))
                {
                    continue;
                }

                foreach (var replacement in group)
                {
                    var variant = ReplaceWholeTerm(normalizedKeyword, term, replacement);
                    if (seen.Add(variant))
                    {
                        variants.Add(variant);
                    }

                    if (variants.Count >= MaxVariants)
                    {
                        break;
                    }
                }
            }

            return variants;
        }

        private static bool ContainsWholeTerm(string input, string term)
        {
            return Regex.IsMatch(input, WholeTermPattern(term), RegexOptions.CultureInvariant);
        }

        private static string ReplaceWholeTerm(string input, string term, string replacement)
        {
            return Regex.Replace(
                input,
                WholeTermPattern(term),
                _ => replacement,
                RegexOptions.CultureInvariant);
        }

        private static string WholeTermPattern(string term)
        {
            return $@"(?<![\p{{L}}\p{{N}}]){Regex.Escape(term)}(?![\p{{L}}\p{{N}}])";
        }

        private static string Normalize(string value)
        {
            var decomposed = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder(decomposed.Length);

            foreach (var character in decomposed)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(character == 'đ' ? 'd' : character);
                }
            }

            return Regex.Replace(
                builder.ToString().Normalize(NormalizationForm.FormC),
                @"\s+",
                " ");
        }
    }
}
