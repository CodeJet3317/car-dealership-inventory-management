import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startUserTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    allowClose: true,
    nextBtnText: "Next →",
    prevBtnText: "← Back",
    doneBtnText: "Finish 🎉",
    overlayColor: "rgba(15, 23, 42, 0.85)",
    onPopoverRendered: () => {
      const closeBtn = document.querySelector(".driver-popover-close-btn");
      if (closeBtn) {
        closeBtn.innerHTML = "Skip ✕";
      }
    },
    onCloseClick: () => {
      localStorage.setItem("has_completed_tour", "true");
      driverObj.destroy();
    },
    onDestroyStarted: () => {
      localStorage.setItem("has_completed_tour", "true");
      driverObj.destroy();
    },
    onDestroyed: () => {
      localStorage.setItem("has_completed_tour", "true");
    },
    steps: [
      {
        element: "#nav-brand",
        popover: {
          title: "Welcome to Dealership Portal! 🚗",
          description:
            "This is your central hub for exploring available car models, searching inventory, and placing orders.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#search-panel",
        popover: {
          title: "Live Auto-Suggest Search 🔍",
          description:
            "Type Make or Category to get instant auto-suggestions. Navigate options using your Up/Down arrow keys and press Enter to select.",
          side: "bottom",
          align: "center",
        },
      },
      {
        element: "#view-toggle",
        popover: {
          title: "Grid vs List Layout 📱",
          description:
            "Switch seamlessly between 3-column card view and horizontal list view based on your browsing preference.",
          side: "left",
          align: "center",
        },
      },
      {
        element: "#vehicle-grid",
        popover: {
          title: "Vehicle Purchase Action 🛒",
          description:
            "Click 'Purchase Vehicle' on any available car card to choose your order quantity and calculate total cost.",
          side: "top",
          align: "center",
        },
      },
      {
        element: "#pagination-panel",
        popover: {
          title: "Custom Pagination 📄",
          description:
            "Control how many vehicles to display per page (5, 10, 20, 50, or All) and navigate pages effortlessly.",
          side: "top",
          align: "center",
        },
      },
    ],
  });

  driverObj.drive();
};
