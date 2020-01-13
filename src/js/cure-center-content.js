function updatePage() {
  if (
    $('[id^=epw_]').length !== 0 &&
    $('#entry_display_container').length === 0
  ) {
    addEntryDisplayWrapper();
    addEntriesToList();
    $('#entry-list-toggle').on('click', handleMenuToggle);

    observeEntryNodeUpdate(300);
    observeEntryDisplayResize();
  }
}

function handleMenuToggle() {
  $(this)
    .children('i')
    .toggleClass('ms-Icon--ChevronLeftSmall');
  $(this)
    .children('i')
    .toggleClass('ms-Icon--ChevronRightSmall');

  $('#entry-list-column').css('visibility') === 'hidden'
    ? $('#entry-list-column').css('visibility', 'visible')
    : $('#entry-list-column').css('visibility', 'hidden');

  $('#entry-list-column').width() === 0
    ? $('#entry-list-column').css({ width: '20%' })
    : $('#entry-list-column').width(0);

  $('#entry-column').css({ width: getEntryColumnWidth() });
}

function addEntryDisplayWrapper() {
  // Entries from LabArchives
  $('#entry_display').wrapInner(
    `<div id="entry_display_container" class="container-fluid">
                <div class="row position-relative">
                    <div class="col-auto position-fixed mx-0" id="entry-column"></div>
                </div>
            </div>`
  );

  // Entry navigation list
  $('#entry_display_container .row').prepend(
    `<div class="col-auto position-fixed border-right d-flex pl-1" id="entry-list-column">
                <ul class="list-group mb-2 flex-fill" id="custom_entry_list"></ul>
            </div>`
  );

  // Entry navigaton list toggle button
  $('#entry_display_container .row').prepend(
    `<div class="col-auto position-fixed px-1" id="entry-button-column">
                <div class="mt-3" style="font-size: 16px">
                    <button type="button" class="btn btn-sm btn-outline-dark px-1" id="entry-list-toggle">
                        <i class="ms-Icon ms-Icon--ChevronLeftSmall" aria-hidden="true"></i>
                    </button>    
                </div>
            </div>`
  );

  setEntryDisplayWrapperCSS();
}

function setEntryDisplayWrapperCSS() {
  const entryDisplayOuterHeight = $('#entry_display').outerHeight();

  $('#entry-button-column').css({
    height: '200px',
    width: '32px',
    'overflow-y': 'auto'
  });

  $('#entry-list-column').css({
    height: entryDisplayOuterHeight,
    width: '20%',
    left: getEntryListColumnLeftOffset(),
    'overflow-y': 'auto',
    transition: 'left .3s ease-in-out'
  });

  $('#entry-column').css({
    height: entryDisplayOuterHeight,
    width: getEntryColumnWidth(),
    'overflow-y': 'auto',
    right: 0,
    transition: 'width .3s ease-in-out'
  });
}

function getEntryColumnWidth() {
  return (
    $('#entry_display').innerWidth() -
    $('#entry-list-column').outerWidth() -
    $('#entry-button-column').outerWidth()
  );
}

function getEntryListColumnLeftOffset() {
  return (
    ($('.la-drawer--hidden').length === 0 ? $('.la-drawer').outerWidth() : 0) +
    $('#entry-button-column').outerWidth() +
    parseInt($('#content').css('padding-left'), 10)
  );
}

function addEntriesToList() {
  const entryWrappers = $('[id^=epw_]');
  const elements = [];

  entryWrappers.each(function() {
    const entryData = getEntryData($(this));
    const listElement = createListElement(entryData.entry, entryData.entryId);

    elements.push(`<a 
        href="#${entryData.wrapperId}" 
        id="${entryData.menuId}" 
        class="list-group-item list-group-item-action">${listElement}
      </a>`);
  });
  $('#custom_entry_list').append(elements);
}

function getEntryData(entryWrapper) {
  return {
    wrapperId: entryWrapper.attr('id'),
    get id() {
      return this.wrapperId.split('_')[1];
    },
    get entryId() {
      return `ept_${this.id}`;
    },
    get entry() {
      return $(`#${this.entryId}`);
    },
    get menuId() {
      return `eml_${this.id}`;
    }
  };
}

function createListElement(entry, entryId) {
  const [icon, innerText] = iconAndTextForEntryType(entry, entryId);

  const element = `
        <div class="d-flex">
            ${icon}
            <div class="mx-2 text-break">${innerText}</div>
        </div>`;

  return element;
}

function iconAndTextForEntryType(entry, entryId) {
  // File attachment entry
  if (
    entry.hasClass('ep_data') &&
    $(`#${entryId} .la_attach_caption`).length !== 0
  ) {
    const fileInfo = getFileInfo(entry.find('.la_attach_caption').text());
    return [
      getListIcon(fileInfo.extension),
      `<div>${fileInfo.name}</div><div>${fileInfo.description}</div>`
    ];
    // Widget entry
  } else if (
    entry.hasClass('ep_data') &&
    $(`#${entryId} iframe`).length !== 0
  ) {
    return [getListIcon('widget'), getInnerText(entry, 'Widget')];
    // Rich Text entry
  } else if (entry.hasClass('ep_rich_text')) {
    return [getListIcon('rich_text'), getInnerText(entry, 'Rich Text Entry')];
    // Other type of entry
  } else {
    return [getListIcon('default'), getInnerText(entry, 'Other')];
  }
}

function getInnerText(entry, defaultText) {
  const treePath = entry.siblings('.div_tree_path');

  if (treePath.length !== 0) {
    const link = treePath.children('a').first();

    return `${link.text()}<br><span class="text-muted">${defaultText}</span>`;
  } else {
    return defaultText;
  }
}

function getFileInfo(caption) {
  caption = caption.replace(/[\u200B]/g, '');
  const [fileInfo, description] = caption.split(/\u00A0/g);
  const [, filename, extension, fileSize] = fileInfo.match(
    /^\s*((?:.*?)(\.\w+)).*?\((.*?)\)/
  );

  return {
    name: filename,
    size: fileSize,
    description: description.trim(),
    extension: extension
  };
}

function getListIcon(type) {
  return icon[type] || icon.default;
}

function isOfficeIcon(name) {
  return `<div><div class="ms-BrandIcon--icon16 ms-BrandIcon--${name}" /></div>`;
}

function isGenericIcon(name) {
  return `<i class="ms-Icon ms-Icon--${name}" aria-hidden="true" style="font-size: 16px"></i>`;
}

const icon = {
  '.doc': isOfficeIcon('word'),
  '.docx': isOfficeIcon('word'),
  '.xlsx': isOfficeIcon('excel'),
  '.xls': isOfficeIcon('excel'),
  '.csv': isOfficeIcon('csv'),
  '.ppt': isOfficeIcon('powerpoint'),
  '.pptx': isOfficeIcon('powerpoint'),
  '.jpg': isGenericIcon('Photo2'),
  '.jpeg': isGenericIcon('Photo2'),
  '.png': isGenericIcon('Photo2'),
  '.svg': isGenericIcon('Photo2'),
  '.pdf': isGenericIcon('PDF'),
  '.jmp': isGenericIcon('BarChartVerticalFill'),
  '.pzfx': isGenericIcon('BarChartVerticalFill'),
  rich_text: isGenericIcon('Articles'),
  widget: isGenericIcon('CubeShape'),
  default: isGenericIcon('KnowledgeArticle')
};

function observeEntryDisplayResize() {
  const entryDisplay = $('#entry_display')[0];
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      const newHeight = $('#entry_display').innerHeight();

      $('#entry-column').outerWidth(getEntryColumnWidth());
      $('#entry-column').outerHeight(newHeight);

      $('#entry-list-column').css({ left: getEntryListColumnLeftOffset() });
      $('#entry-list-column').outerHeight(newHeight);
    });
  });

  observer.observe(entryDisplay);
}

function observeEntryDisplayNodeAddition(timing) {
  const interval = setInterval(func, timing);

  function func() {
    if ($('#content').length !== 0) {
      const content = $('#content')[0];

      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          const addedNodes = mutation.addedNodes;

          addedNodes.forEach(node => {
            if ($(node).attr('id') === 'entry_display') {
              updatePage();
            }
          });
        });
      });
      observer.observe(content, { childList: true });
      clearInterval(interval);
    }
  }
}

function observeEntryNodeUpdate(timing) {
  const interval = setInterval(func, timing);

  function func() {
    if ($('#entry-column').length !== 0) {
      const content = $('#entry-column')[0];

      const observer = new MutationObserver(mutations => {
        mutations.forEach(_ => {
          $('#custom_entry_list a').remove();
          addEntriesToList();
        });
      });

      observer.observe(content, { childList: true });
      clearInterval(interval);
    }
  }
}

$(document).ready(function() {
  observeEntryDisplayNodeAddition(300);
});
