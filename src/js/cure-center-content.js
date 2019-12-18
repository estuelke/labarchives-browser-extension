function updatePage() {
    if($('.ep_wrapper').length !== 0) {
        addEntryList();
    }
}

function addEntryList() {
    if($(`#entry_display_container`).length === 0){

        $('#entry_display').wrapInner(
            `<div id="entry_display_container" class="container-fluid">
                <div class="row mt-2">
                    <div class="col-lg-8 col-lg-offset-5"></div>
                </div>
            </div>`
        );
        
        $('#entry_display_container .row').prepend(
            `<div class="col-lg-4 position-relative">
                <div class="col-lg-3 position-fixed">
                    <ul class="list-group" id="custom_entry_list"></ul>
                </div>
            </div>`
        );

        addEntriesToList();
    }
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

setTimeout(()=>updatePage(), 1000);

$(document).ready(function() {
    setTimeout(()=>updatePage(), 1000);

    $(document).on('click', '.la-treenode' ,() => {
        setTimeout(()=>updatePage(), 1000);
    });
});
