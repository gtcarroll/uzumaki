// class for reading JSON project data and creating/adding respective html elements
// TODO: write js file that tabs output perfectly
// TODO: write function that finds longest string combo in ["contols"] and
//       outputs number of ~ characters needed to justify each ctrl text
class ProjectParser {
    constructor(projNames) {
        projNames.forEach(element => ProjectParser.loadJSON(element));
    }
    
    // retrieve json file and add to html on load
    static loadJSON(projName) {
        let request = new XMLHttpRequest(),
            filepath = "projects/" + projName.toLowerCase() + "/project.json";
        
        request.open("GET", filepath);
        request.responseType = "json";
        request.onload = function() {
            let projJSON = request.response;
            ProjectParser.addProject(projJSON);
        }
        request.send();
    }
    
    // build and append "project" article for given JSON data
    static addProject(projJSON) {
        let project = document.createElement("article");
        
        // format "project" article
        project.classList.add("project");
        project.id = projJSON["title"].toLowerCase();
        project.appendChild(ProjectParser.buildHeader(projJSON));
        project.appendChild(ProjectParser.buildDescription(projJSON));
        project.appendChild(ProjectParser.buildDemo(projJSON));
        project.appendChild(ProjectParser.buildControls(projJSON));
        project.appendChild(ProjectParser.buildGallery(projJSON));
        
        // append to "project-list"
        let projectList = document.querySelector("#project-list");
        
        console.log(project.outerHTML);
        
        //projectList.innerHTML = "";
        //projectList.appendChild(project);
        
        //console.log(projectList.innerHTML);
    }
    
    // build "project-header" div for "project" article
    static buildHeader(projJSON) {
        let header = document.createElement("div"),
            h2 = document.createElement("h2");
        
        // format h2
        h2.innerHTML = projJSON["title"];
        header.appendChild(h2);
        
        header.classList.add("project-header");
        return header;
    }
    
    // build "project-description" div for "project" article
    static buildDescription(projJSON) {
        let description = document.createElement("div"),
            p = document.createElement("p");
        
        // format p
        p.innerHTML = projJSON["subtitle"] + ", " + projJSON["date"];
        description.appendChild(p);
        
        description.classList.add("project-description");
        return description;
    }
    
    // build "project-demo" div for "project" article
    static buildDemo(projJSON) {
        let demo = document.createElement("div"),
            h3 = document.createElement("h3"),
            sketch = document.createElement("div"),
            overlay = document.createElement("pre"),
            button = document.createElement("button");
        
        // format h3
        h3.innerHTML = "D E M O";
        demo.appendChild(h3);
        
        // format sketch (and overlay)
        sketch.classList.add("sketch");
        overlay.classList.add("overlay");
        sketch.appendChild(overlay);
        demo.appendChild(sketch);
        
        // format button
        button.classList.add("button-fullscreen");
        button.innerHTML = "fullscreen";
        demo.appendChild(button);
        
        demo.classList.add("project-demo");
        return demo;
    }
    
    // build "project-control" div for "project" article
    static buildControls(projJSON) {
        let controls = document.createElement("div"),
            h3 = document.createElement("h3"),
            grid = document.createElement("div"),
            divKb = document.createElement("div"),
            divMs = document.createElement("div");
        
        // format h3
        h3.innerHTML = "C O N T R O L S";
        controls.appendChild(h3);
        
        // format ctrlGrid
        grid.classList.add("ctrl-grid");
        divKb.classList.add("keyboard");
        divMs.classList.add("mouse");
            
        // append chars to justify content
        ProjectParser.justify(projJSON["controls"]);
        
        // add controls to grid
        projJSON["controls"].forEach(ctrl => {
            let p = document.createElement("p"),
                fxnTxt = ctrl["function"].split(/\[|\]/);
            
            // format p
            p.innerHTML += ctrl["input"] + " ";
            
            // add .spot span if applicable
            if (fxnTxt.length == 3) {
                let span = document.createElement("span");
                span.classList.add("spot");
                span.innerHTML = fxnTxt[1];
                
                p.innerHTML += fxnTxt[0];
                p.appendChild(span);
                p.innerHTML += fxnTxt[2];
            } else {
                p.innerHTML += ctrl["function"];
            }
            
            // append to appropriate div
            if (ctrl["type"] == "keyboard") divKb.appendChild(p);
            else if (ctrl["type"] == "mouse") divMs.appendChild(p);
        });
        grid.appendChild(divKb);
        grid.appendChild(divMs);
        controls.appendChild(grid);
        
        controls.classList.add("project-controls");
        return controls;
    }
    
    // build "project-gallery" div for "project" article
    static buildGallery(projJSON) {
        let gallery = document.createElement("div"),
            h3 = document.createElement("h3"),
            grid = document.createElement("div");
        
        // format h3
        h3.innerHTML = "G A L L E R Y";
        gallery.appendChild(h3);
        
        // format grid
        grid.classList.add("gall-grid");
        
        // add images to grid
        projJSON["gallery"].forEach(pic => {
            let img = document.createElement("img"),
                filepath = "projects/" + projJSON["title"].toLowerCase() + "/gallery/";
            
            // format img
            img.setAttribute("alt", pic["alt"]);
            img.setAttribute("src", filepath + pic["url"]);
            
            grid.appendChild(img);
        });
        gallery.appendChild(grid);
        
        gallery.classList.add("project-gallery");
        return gallery;
    }
    
    // Append '~' chars such that all control elements are justified
    static justify(controls) {
        let maxLength = 0,
            lengths = [];
        
        // first pass to get max length
        controls.forEach(ctrl => {
            let fxnLength = ctrl["input"].length + ctrl["function"].length,
                altLength = (ctrl["alt-function"] == null) ? 0 
                            : ctrl["input"].length + ctrl["alt-function"].length;
            
            // add to lengths for second pass
            lengths.push({el: ctrl, fxn: fxnLength, alt: altLength});
            
            let localMax = Math.max(fxnLength, altLength);
            if (localMax > maxLength) maxLength = localMax;
        });
        
        // second pass to append '~' chars
        lengths.forEach(obj => {
            let fxnChars = 1,
                altChars = 1,
                fxnSpace = "",
                altSpace = "";
            
            // append to "function"
            fxnChars += maxLength - obj.fxn;
            for (var i = 0; i < fxnChars; i++) fxnSpace += "~";
            obj.el["function"] = fxnSpace + " " + obj.el["function"];
            
            // append to "alt-function"
            if (obj.el["alt-function"] != null) {
                altChars += maxLength - obj.alt;
                for (var i = 0; i < altChars; i++) fxnSpace += "~";
                obj.el["alt-function"] = fxnSpace + " " + obj.el["alt-function"];
            }
        });
    }
}