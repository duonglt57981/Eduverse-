# SDK Image for building
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY Eduverse.sln ./
COPY Eduverse.Api/Eduverse.Api.csproj Eduverse.Api/
COPY Eduverse.Model/Eduverse.Model.csproj Eduverse.Model/
COPY Eduverse.Repository/Eduverse.Repository.csproj Eduverse.Repository/
COPY Eduverse.Service/Eduverse.Service.csproj Eduverse.Service/
COPY Eduverse.Tests/Eduverse.Tests.csproj Eduverse.Tests/

# Restore dependencies
RUN dotnet restore

# Copy all source files and build
COPY . .
RUN dotnet build -c Release -o /app/build

# Dev runner stage: includes SDK for hot-reloading/run
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dev
WORKDIR /app
COPY --from=build /src /app
ENV ASPNETCORE_ENVIRONMENT=Development
ENV ASPNETCORE_URLS=http://+:5002
EXPOSE 5002
CMD ["dotnet", "run", "--project", "Eduverse.Api/Eduverse.Api.csproj", "--launch-profile", "http"]

# Prod publish stage
FROM build AS publish
RUN dotnet publish "Eduverse.Api/Eduverse.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Prod runner stage: lightweight runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS prod
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:5002
EXPOSE 5002
ENTRYPOINT ["dotnet", "Eduverse.Api.dll"]
