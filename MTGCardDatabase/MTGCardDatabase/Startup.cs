using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MTGCardDatabase.Models;
using MTGDatabase.Models;

namespace MTGCardDatabase
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();

            services.AddOptions();

            services.Configure<WebConfiguration>(options =>
            {
                options.mtgdatabaseConnectionString = Configuration["ConnectionStrings:mtgdatabase_AzureStorageConnectionString"];
                options.cardTableName = Configuration["TableNames:cardTable"];
                options.deckTableName = Configuration["TableNames:deckTable"];
                options.deckCardTableName = Configuration["TableNames:deckcardTable"];
                options.deckTrackerTableName = Configuration["TableNames:deckTrackerTable"];
                options.cubeStats = Configuration["TableNames:cubeStats"];
                options.metaDecksTableName = Configuration["TableNames:metaDeckTable"];
                options.deckVersusMetaDeckTable = Configuration["TableNames:deckVersusMetaDeckTable"];
                options.playerTableName = Configuration["TableNames:playerTableName"];
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true
                });
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
            }

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" });
            });
        }
    }
}
