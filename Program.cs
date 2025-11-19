using API.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddDbContext<DataContext>(options =>
{
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddControllers();

var app = builder.Build();

// HTTP pipeline
if (app.Environment.IsDevelopment())
{
}

app.UseHttpsRedirection();
app.MapControllers();

app.Run();
