export function restoreOriginalView(): void {
    const mainContent = document.getElementById("main-content") as HTMLElement;
    mainContent.innerHTML = `
        <%- include("partials/original-view") %>
    `;
}