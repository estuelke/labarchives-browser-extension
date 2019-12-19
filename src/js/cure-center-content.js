function updatePage() {
    if($('.ep_wrapper').length !== 0) {
        addEntryList();
        observeEntryDisplayResize();
    }
}


function setToggleEvent() {
    $('#entry-list-toggle').on('click', function () {
        $(this).children('i').toggleClass('ms-Icon--ChevronLeftSmall');
        $(this).children('i').toggleClass('ms-Icon--ChevronRightSmall');

        $('#entry-list-column').css('visibility') === 'hidden' ?
            $('#entry-list-column').css('visibility', 'visible') :
            $('#entry-list-column').css('visibility', 'hidden');

        $('#entry-list-column').width() === 0 ?
            $('#entry-list-column').css({ 'width': '20%' }) :
            $('#entry-list-column').width(0);

        $('#entry-column').css({ 'width': getEntryColumnWidth() })
    });
}


function addEntryList() {
    if($(`#entry_display_container`).length === 0){
        // Entries from LabArchives
        $('#entry_display').wrapInner(
            `<div id="entry_display_container" class="container-fluid">
                <div class="row position-relative">
                    <div class="col-lg-auto position-fixed mx-0" id="entry-column"></div>
                </div>
            </div>`
        );
        
        // Entry navigation list
        $('#entry_display_container .row').prepend(
            `<div class="col-lg-auto position-fixed border-right d-flex pl-1" id="entry-list-column">
                <ul class="list-group mb-2 flex-fill" id="custom_entry_list"></ul>
            </div>`
        );
        
        // Entry navigaton list toggle button
        $('#entry_display_container .row').prepend(
            `<div class="col-lg-auto position-fixed px-1" id="entry-button-column">
                <div class="mt-3" style="font-size: 16px">
                    <button type="button" class="btn btn-sm btn-outline-dark px-1" id="entry-list-toggle">
                        <i class="ms-Icon ms-Icon--ChevronLeftSmall" aria-hidden="true"></i>
                    </button>    
                </div>
            </div>`
        );
        setToggleEvent();
        setEntryColumnCSS();
        addEntriesToList();
    }
}

function setEntryColumnCSS() {
    $('#entry-button-column').css({
        'height': $('#page-bgtop').outerHeight() - $('#page_header').outerHeight(), 
        'width': '32px',
        'overflow-y': 'auto'
    });
    
    $('#entry-list-column').css({
        'height': $('#page-bgtop').outerHeight() - $('#page_header').outerHeight(), 
        'width': '20%',
        'left': $('.la-drawer').outerWidth() + $('#entry-button-column').outerWidth() + parseInt($('#content').css('padding-left'), 10),
        'overflow-y': 'auto'
    });

    $('#entry-column').css({
        'height': $('#page-bgtop').outerHeight() - $('#page_header').outerHeight(),
        'width': getEntryColumnWidth(),
        'overflow-y': 'auto',
        'right': 0,
        'transition': 'all .5s linear'
    });
}

function getEntryColumnWidth() {
    return $('#entry_display').innerWidth() - $('#entry-list-column').outerWidth() - $('#entry-button-column').outerWidth();
}

function addEntriesToList() {
    const entryWrappers = $('.ep_wrapper');
    
    entryWrappers.each(function() {
        const wrapperId = $(this).attr('id');
        const id = wrapperId.split('_')[1];
        const entryId = `ept_${id}`;
        const entry = $(`#${entryId}`);
        const listElement = createListElement(entry, entryId);

        $('#custom_entry_list').append(
            `<a href="#${wrapperId}" class="list-group-item list-group-item-action">${listElement}</a>`
        );
    });
}

function createListElement(entry, entryId) {
    let icon;
    let innerText;
    
    if (entry.hasClass('ep_data') && $(`#${entryId} .la_attach_caption`).length !== 0) {
        const fileInfo = getFileInfo(entry.find(".la_attach_caption").text());
        icon = getListIcon(fileInfo.extension);
        innerText = `<div>${fileInfo.name}</div><div>${fileInfo.description}</div>`;
    } else if (entry.hasClass('ep_data') && $(`#${entryId} iframe`).length !== 0) {
        icon = getListIcon('widget');
        innerText = getInnerText(entry, 'Widget');
    } else if (entry.hasClass('ep_rich_text')) {
        icon = getListIcon('rich_text');
        innerText = getInnerText(entry, 'Rich Text Entry');
    } else {
        icon = getListIcon('default');
        innerText = getInnerText(entry, 'Other');
    }

    const element = `
        <div class="d-flex">
            ${icon}
            <div class="mx-2 text-break">${innerText}</div>
        </div>`;

    return element;
}

function getInnerText(entry, defaultText) {
    if (entry.parent().children('.div_tree_path').length !== 0) {
        const parent = entry.parent();
        const treePath = parent.children('.div_tree_path')
        const link = treePath.children('a');
        return `${link.text()}<br><span class="text-muted">${defaultText}</span>`;
    } else {
        return defaultText;
    }
}

function getFileInfo(caption) {
    caption = caption.replace(/[\u200B]/g, "");
    const [fileInfo, description] = caption.split(/\u00A0/g);
    filename = fileInfo.substring(0,fileInfo.lastIndexOf('('));
    fileSize = fileInfo.substring(fileInfo.lastIndexOf('(') + 1, fileInfo.lastIndexOf(')'));
    extension = filename.substring(filename.lastIndexOf('.'), filename.length);

    return {name: filename, size: fileSize, description: description.trim(), extension: extension};
}

function getListIcon(type) {

    function isOfficeIcon(name) {
        return `<div><div class="ms-BrandIcon--icon16 ms-BrandIcon--${name}" /></div>`;
    };

    function isGenericIcon(name) {
        return `<i class="ms-Icon ms-Icon--${name}" aria-hidden="true" style="font-size: 16px"></i>`;
    };

    const icon =  {
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
        '.pdf': isGenericIcon('PDF'),
        '.jmp': isGenericIcon('BarChartVerticalFill'),
        '.pzfx': isGenericIcon('BarChartVerticalFill'),
        'rich_text': isGenericIcon('Articles'),
        'widget': isGenericIcon('CubeShape'),
        'default': isGenericIcon('KnowledgeArticle')
    };
    
    return icon[type] || icon['default'];
}

function observeEntryDisplayResize() {
    const entryDisplay = $('#entry_display')[0];
    const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
            setTimeout(() => $('#entry-column').outerWidth(getEntryColumnWidth()), 300);
        })
    })

    observer.observe(entryDisplay);
}


$(document).ready(function() {
    setTimeout(()=>updatePage(), 2000);
    
    $(document).on('click', '.la-treenode' ,() => {
        setTimeout(()=>updatePage(), 2000);
    });

    $('#search-submit').on('click', () => {
        setTimeout(() => updatePage(), 2000);
    });
});
